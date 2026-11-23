'use client'

import Link from 'next/link'
import { useEffect, useRef, type FormEvent, type ReactNode } from 'react'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { Boton } from '@/shared/ui/Boton'
import { foco } from '@/shared/ui/EnlaceBoton'
import { FilaAcciones } from '@/shared/ui/FilaAcciones'
import { LayoutPaso } from '@/shared/ui/LayoutPaso'
import type { DatosForma } from '../domain/forma'
import type { TextosHabilidades } from '../language/tipos'
import { FinalForma } from './components/FinalForma'
import { PreguntaForma } from './components/PreguntaForma'
import { PuntosPregunta } from './components/PuntosPregunta'
import { ResumenRespuestas } from './ui/ResumenRespuestas'
import { useForma, type AccionGuardarForma } from './hooks/useForma'
import { mensajeDeErrorSocio, vistaForma } from './mappers/vistaForma'

export type FormaViewProps = {
  textos: TextosHabilidades
  /** Lo que ya contestó, si vuelve a este paso */
  inicial: DatosForma
  alGuardar: AccionGuardarForma
  /** Lo de arriba (barra con el logo y «Saltar», y el progreso); lo pone quien arma la pantalla, y va fuera del <main> */
  barra: ReactNode
  /** El número del paso, para rotularlo («Paso 05») */
  paso: number
  hrefAtras: string
  /** Adónde va la persona en cuanto se guarda lo que contestó */
  hrefSiguiente: string
}

const claseAnterior = `text-etiqueta cursor-pointer underline underline-offset-8 ${foco}`
const claseSiguiente = `text-parrafo cursor-pointer underline underline-offset-[6px] ${foco}`

// «Tu forma de emprender»: seis preguntas de una en una (todas opcionales) y, al final, el perfil que busca y su socio ideal.
export function FormaView({ textos, inicial, alGuardar, barra, paso, hrefAtras, hrefSiguiente }: FormaViewProps) {
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
      <LayoutPaso
        etiqueta={rellenarPlantilla(textos.comun.numeroPaso, { n: String(paso).padStart(2, '0') })}
        titulo={t.titulo}
        subtitulo={t.subtitulo}
        porQue={{ titulo: textos.comun.porQue, texto: t.porQue }}
      >
        <form noValidate onSubmit={alEnviar}>
          {pregunta ? (
            <>
              <PreguntaForma
                textos={t}
                pregunta={pregunta}
                alElegir={e.elegir}
                alPulsar={e.avanzarTrasElegir}
                puntos={<PuntosPregunta textos={t} preguntas={preguntas} indice={e.indice} respondidas={e.respondidas} alIrA={e.ir} />}
              />
              <div className="mt-[1.125rem] flex items-center justify-between gap-4">
                {e.indice > 0 ? (
                  <button type="button" onClick={() => e.ir(e.indice - 1)} className={claseAnterior}>
                    <span aria-hidden="true">← </span>
                    {t.anterior}
                  </button>
                ) : (
                  <span />
                )}
                <button type="button" onClick={() => e.ir(e.indice + 1)} className={claseSiguiente}>
                  {pregunta.respuesta ? t.siguientePregunta : t.saltar}
                  {pregunta.respuesta && <span aria-hidden="true"> →</span>}
                </button>
              </div>
              <div className="mt-5">
                <ResumenRespuestas textos={t} preguntas={preguntas} respondidas={e.respondidas} alIrA={e.ir} />
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
            <p role="alert" className="text-cuerpo mt-5 flex items-start gap-2.5 rounded-xl border-2 border-primario px-4 py-3 font-medium">
              <span aria-hidden="true" className="text-etiqueta-chica mt-0.5 inline-flex size-5 flex-none items-center justify-center rounded-full bg-primario leading-none text-tarjeta">
                !
              </span>
              <span>{t.avisos[e.aviso]}</span>
            </p>
          )}

          <FilaAcciones
            izquierda={
              <Link href={hrefAtras} className={`text-etiqueta underline underline-offset-8 ${foco}`}>
                <span aria-hidden="true">← </span>
                {t.atras}
              </Link>
            }
            derecha={
              <Boton tipo="submit" lleno deshabilitado={e.enviando || e.guardado} cursorDeshabilitado="espera">
                {e.enviando || e.guardado ? t.guardando : t.terminar}
              </Boton>
            }
          />
        </form>
      </LayoutPaso>
    </>
  )
}
