'use client'

import Link from 'next/link'
import { useEffect, useRef, type FormEvent, type ReactNode } from 'react'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { Boton } from '@/shared/ui/Boton'
import { foco } from '@/shared/ui/EnlaceBoton'
import type { DatosForma } from '../domain/forma'
import type { TextosHabilidades } from '../language/tipos'
import { FinalForma } from './components/FinalForma'
import { PreguntaForma } from './components/PreguntaForma'
import { useForma, type AccionGuardarForma } from './hooks/useForma'
import { mensajeDeErrorSocio, vistaForma } from './mappers/vistaForma'

export type FormaViewProps = {
  textos: TextosHabilidades
  /** Lo que ya contestó, si vuelve a este paso */
  inicial: DatosForma
  alGuardar: AccionGuardarForma
  /** La barra de arriba (logo, progreso y «Saltar»); la pone quien arma la pantalla, y va fuera del <main> */
  barra: ReactNode
  hrefAtras: string
  /** Adónde va la persona en cuanto se guarda lo que contestó */
  hrefSiguiente: string
}

const claseBotonSecundario = `text-etiqueta cursor-pointer underline underline-offset-8 ${foco}`

// «Tu forma de emprender»: seis preguntas de una en una (todas opcionales) y, al final, el perfil que busca y su socio ideal.
export function FormaView({ textos, inicial, alGuardar, barra, hrefAtras, hrefSiguiente }: FormaViewProps) {
  const t = textos.forma
  const e = useForma(inicial, alGuardar, hrefSiguiente)
  const preguntas = vistaForma(t, e.datos.respuestas)
  const pregunta = preguntas[e.indice]
  const primeraVez = useRef(true)

  // Al cambiar de pregunta el foco va a su título (no al cargar la pantalla, para no saltar de entrada)
  useEffect(() => {
    if (primeraVez.current) {
      primeraVez.current = false
      return
    }
    document.getElementById('titulo-pregunta-forma')?.focus()
  }, [e.indice])

  function alEnviar(evento: FormEvent) {
    evento.preventDefault()
    void e.enviar()
  }

  return (
    <>
      {barra}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-6 py-9 escritorio:py-[4.5rem]">
          <h1 className="text-titulo-seccion texto-equilibrado">{t.titulo}</h1>
          <p className="text-parrafo-grande mt-3 max-w-xl opacity-85">{t.subtitulo}</p>
          <p className="text-cuerpo mt-3 max-w-xl opacity-75">{t.porQue}</p>

          <form noValidate onSubmit={alEnviar} className="mt-8 grid gap-7">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
              <ol aria-label={rellenarPlantilla(t.resumen, { n: e.respondidas, total: e.total })} className="flex gap-2">
                {preguntas.map((candidata, indice) => (
                  <li key={candidata.id}>
                    <button
                      type="button"
                      onClick={() => e.ir(indice)}
                      aria-label={rellenarPlantilla(t.progreso, { n: indice + 1, total: e.total })}
                      aria-current={indice === e.indice ? 'step' : undefined}
                      data-respondida={candidata.respuesta ? true : undefined}
                      className={`h-2.5 w-8 cursor-pointer rounded-full border border-texto ${candidata.respuesta ? 'bg-texto' : 'bg-transparent'} ${indice === e.indice ? 'outline-2 outline-offset-2 outline-texto' : ''} ${foco}`}
                    />
                  </li>
                ))}
              </ol>
              <p className="text-etiqueta-chica opacity-75">{rellenarPlantilla(t.resumen, { n: e.respondidas, total: e.total })}</p>
            </div>

            {pregunta ? (
              <>
                <PreguntaForma textos={t} pregunta={pregunta} alElegir={e.elegir} alPulsar={e.avanzarTrasElegir} />
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  {e.indice > 0 && (
                    <button type="button" onClick={() => e.ir(e.indice - 1)} className={claseBotonSecundario}>
                      <span aria-hidden="true">← </span>
                      {t.anterior}
                    </button>
                  )}
                  <button type="button" onClick={() => e.ir(e.indice + 1)} className={claseBotonSecundario}>
                    {pregunta.respuesta ? t.siguientePregunta : t.saltar}
                  </button>
                </div>
              </>
            ) : (
              <FinalForma
                textos={t}
                preguntas={preguntas}
                respondidas={e.respondidas}
                busca={e.datos.busca}
                socioIdeal={e.datos.socioIdeal}
                errorSocio={mensajeDeErrorSocio(t, e.errores.socioIdeal)}
                alIrA={e.ir}
                alternarArea={e.alternarArea}
                escribirSocio={e.escribirSocio}
              />
            )}

            {e.aviso && (
              <p role="alert" className="text-cuerpo flex items-start gap-2.5 rounded-xl border-2 border-primario px-4 py-3 font-medium">
                <span aria-hidden="true" className="text-etiqueta-chica mt-0.5 inline-flex size-5 flex-none items-center justify-center rounded-full bg-primario leading-none text-tarjeta">
                  !
                </span>
                <span>{t.avisos[e.aviso]}</span>
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-borde/15 pt-6">
              <Link href={hrefAtras} className={`text-etiqueta underline underline-offset-8 ${foco}`}>
                <span aria-hidden="true">← </span>
                {t.atras}
              </Link>
              <Boton tipo="submit" lleno deshabilitado={e.enviando || e.guardado} cursorDeshabilitado="espera">
                {e.enviando || e.guardado ? t.guardando : t.terminar}
              </Boton>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
