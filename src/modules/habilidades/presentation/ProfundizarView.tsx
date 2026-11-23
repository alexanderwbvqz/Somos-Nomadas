'use client'

import Link from 'next/link'
import { useEffect, type FormEvent, type ReactNode } from 'react'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { CampoArea } from '@/shared/ui/Campos'
import { Boton } from '@/shared/ui/Boton'
import { foco } from '@/shared/ui/EnlaceBoton'
import { SeccionPlegable } from '@/shared/ui/SeccionPlegable'
import type { HabilidadId } from '../domain/catalogo'
import type { Marcas } from '../domain/perfilArea'
import { LIMITE_TEXTO, type RespuestasProfundizacion } from '../domain/preguntas'
import type { TextosHabilidades } from '../language/tipos'
import { PreguntaDeOpciones } from './components/PreguntaDeOpciones'
import { useProfundizar, type AccionGuardarProfundizacion } from './hooks/useProfundizar'
import { vistaSecciones } from './mappers/vistaProfundizar'

export type ProfundizarViewProps = {
  textos: TextosHabilidades
  /** Sus tres habilidades más fuertes, de más a menos */
  habilidades: readonly HabilidadId[]
  /** Lo que marcó en «Qué has hecho», para decir cuántas veces hizo cada una */
  marcas: Marcas
  /** Lo que ya contó, si vuelve a este paso */
  contadasIniciales: Partial<Record<HabilidadId, RespuestasProfundizacion>>
  alGuardar: AccionGuardarProfundizacion
  /** La barra de arriba (logo, progreso y «Saltar»); la pone quien arma la pantalla, y va fuera del <main> */
  barra: ReactNode
  hrefAtras: string
  /** Adónde va la persona en cuanto se guarda lo que contó */
  hrefSiguiente: string
}

// «Más de lo que haces»: un acordeón con una sección por cada una de sus tres habilidades más fuertes. Todo es opcional;
// con cuánto tiempo lleva con cada una se afina su nivel.
export function ProfundizarView({ textos, habilidades, marcas, contadasIniciales, alGuardar, barra, hrefAtras, hrefSiguiente }: ProfundizarViewProps) {
  const t = textos.profundizar
  const e = useProfundizar(habilidades, contadasIniciales, alGuardar, hrefSiguiente)
  const secciones = vistaSecciones(textos, habilidades, marcas, e.contadas)

  // Al pasar a la siguiente habilidad, el foco va a su título para que no se pierda
  useEffect(() => {
    if (e.enfoque) document.querySelector<HTMLElement>(`[aria-controls="seccion-${e.enfoque.habilidad}"]`)?.focus()
  }, [e.enfoque])

  function alEnviar(evento: FormEvent) {
    evento.preventDefault()
    void e.enviar()
  }

  const enlaceAtras = (
    <Link href={hrefAtras} className={`text-etiqueta underline underline-offset-8 ${foco}`}>
      <span aria-hidden="true">← </span>
      {secciones.length === 0 ? t.volverATareas : t.atras}
    </Link>
  )

  return (
    <>
      {barra}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-6 py-9 escritorio:py-[4.5rem]">
          <h1 className="text-titulo-seccion texto-equilibrado">{t.titulo}</h1>

          {secciones.length === 0 ? (
            <div className="mt-8">
              <p className="text-parrafo rounded-xl bg-suave px-4 py-3">{t.vacio}</p>
              <div className="mt-6">{enlaceAtras}</div>
            </div>
          ) : (
            <>
              <p className="text-parrafo-grande mt-3 max-w-xl opacity-85">{t.subtitulo}</p>
              <p className="text-cuerpo mt-3 max-w-xl opacity-75">{t.porQue}</p>

              <form onSubmit={alEnviar} className="mt-8">
                <div className="grid gap-3">
                  {secciones.map((seccion, indice) => (
                    <SeccionPlegable
                      key={seccion.habilidad}
                      id={seccion.habilidad}
                      titulo={
                        <span className="block">
                          <span className="text-etiqueta-chica block opacity-65">
                            {rellenarPlantilla(t.habilidadN, { n: seccion.numero, total: seccion.total })} · {rellenarPlantilla(t.loHasHecho, { veces: seccion.veces })}
                          </span>
                          <span className="text-titulo-tarjeta mt-1 block">{seccion.nombre}</span>
                        </span>
                      }
                      detalle={seccion.lista ? `✓ ${t.lista}` : t.pendiente}
                      resumen={seccion.resumen}
                      abierta={e.abierta === seccion.habilidad}
                      alAlternar={() => e.alternarSeccion(seccion.habilidad)}
                    >
                      {seccion.preguntas.map((pregunta) =>
                        pregunta.tipo === 'texto' ? (
                          <div key={pregunta.id} className="mt-6">
                            <CampoArea
                              clave={`${seccion.habilidad}-${pregunta.id}`}
                              etiqueta={
                                <>
                                  {pregunta.titulo} <span className="font-normal opacity-65">{t.opcional}</span>
                                </>
                              }
                              filas={3}
                              maxLength={LIMITE_TEXTO}
                              placeholder={pregunta.ejemplo}
                              valor={pregunta.valor}
                              alCambiar={(texto) => e.escribir(seccion.habilidad, pregunta.id, texto)}
                            />
                          </div>
                        ) : (
                          <PreguntaDeOpciones
                            key={pregunta.id}
                            habilidad={seccion.habilidad}
                            pregunta={pregunta}
                            alElegir={pregunta.tipo === 'una' ? e.elegirUna : e.alternarVarias}
                          />
                        ),
                      )}
                      {indice < secciones.length - 1 && (
                        <button
                          type="button"
                          onClick={() => e.abrirSiguiente(seccion.habilidad)}
                          className={`text-parrafo mt-6 underline underline-offset-4 ${foco}`}
                        >
                          {rellenarPlantilla(t.siguienteHabilidad, { habilidad: secciones[indice + 1]?.nombre ?? '' })} <span aria-hidden="true">→</span>
                        </button>
                      )}
                    </SeccionPlegable>
                  ))}
                </div>

                {e.aviso && (
                  <p role="alert" className="text-cuerpo mt-5 flex items-start gap-2.5 rounded-xl border-2 border-primario px-4 py-3 font-medium">
                    <span aria-hidden="true" className="text-etiqueta-chica mt-0.5 inline-flex size-5 flex-none items-center justify-center rounded-full bg-primario leading-none text-tarjeta">
                      !
                    </span>
                    <span>{t.avisos[e.aviso]}</span>
                  </p>
                )}

                <div className="mt-7 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-borde/15 pt-6">
                  {enlaceAtras}
                  <Boton tipo="submit" lleno deshabilitado={e.enviando || e.guardado} cursorDeshabilitado="espera">
                    {e.enviando || e.guardado ? t.guardando : t.siguiente}
                  </Boton>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </>
  )
}
