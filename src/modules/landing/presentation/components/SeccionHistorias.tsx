'use client'

import { useId } from 'react'
import { Badge } from '@/shared/ui/Badge'
import { CirculoFlecha } from '@/shared/ui/CirculoFlecha'
import { areaTactil, claseBoton, EnlaceBoton, foco } from '@/shared/ui/EnlaceBoton'
import type { Historia } from '../../domain/Historia'
import { useHistoriaActiva } from '../hooks/useHistoriaActiva'
import { colorArea } from '../ui/coloresArea'
import { idPestanaHistoria, PasosHistorias } from '../ui/PasosHistorias'
import { PersonasHistoria } from '../ui/PersonasHistoria'

export type SeccionHistoriasProps = {
  textos: {
    etiqueta: string
    tituloInicio: string
    tituloResaltado: string
    etiquetaLista: string
    etiquetaPersonas: string
    leer: string
    cerrar: string
    aportes: string
    fuente: string
    fuenteNueva: string
    cierre: string
  }
  /** Solo las que se pueden publicar (ya lo decidió el caso de uso) */
  historias: Historia[]
  /** El botón de cierre: su texto y adónde lleva */
  textoBoton: string
  hrefBoton: string
}

// Historias de personas que se complementaron y construyeron algo juntas. La sección toma el color del área de la historia que se
// ve. Se elige con las pestañas de abajo; no cambia sola. «Leer la historia» despliega su texto en el mismo sitio.
export function SeccionHistorias({ textos, historias, textoBoton, hrefBoton }: SeccionHistoriasProps) {
  const { activa, abierta, irA, alternar } = useHistoriaActiva(historias.length)
  const id = useId()
  const idPanel = `${id}-panel`
  const idDetalle = `${id}-detalle`
  const historia = historias[activa]
  if (historia === undefined) return null

  return (
    <section
      aria-labelledby="titulo-historias"
      data-area={historia.areaFondo}
      className={`transicion-color relative overflow-hidden ${colorArea[historia.areaFondo]}`}
    >
      <div className="mx-auto w-full max-w-7xl px-6 pt-16 escritorio:px-12 escritorio:pt-24">
        <header>
          <Badge>{textos.etiqueta}</Badge>
          <h2 id="titulo-historias" className="text-titulo-medio mt-5 max-w-2xl">
            {textos.tituloInicio} <em className="italic">{textos.tituloResaltado}</em>
          </h2>
        </header>

        <div
          role="tabpanel"
          id={idPanel}
          aria-labelledby={idPestanaHistoria(id, activa)}
          className="relative mt-10 grid gap-10 escritorio:min-h-[26rem] escritorio:grid-cols-[7fr_5fr] escritorio:items-center"
        >
          <span aria-hidden="true" className="text-marca-gigante text-fantasma pointer-events-none absolute -left-2 -top-6 select-none whitespace-nowrap">
            {historia.nombre}
          </span>

          <div className="relative">
            <p className="text-etiqueta-chica">{historia.anio}</p>
            <p className="text-titulo-medio mt-3.5 max-w-xl">
              {historia.frase.inicio} <em className="italic">{historia.frase.resaltado}</em>
              {historia.frase.fin}
            </p>
            <div className="mt-7">
              <button type="button" onClick={alternar} aria-expanded={abierta} aria-controls={idDetalle} className={`${claseBoton(true)} cursor-pointer`}>
                {abierta ? textos.cerrar : textos.leer}
                <span className={`inline-flex ${abierta ? 'rotate-180' : ''}`}>
                  <CirculoFlecha lleno abajo />
                </span>
              </button>
            </div>
          </div>

          <PersonasHistoria personas={historia.personas} etiqueta={textos.etiquetaPersonas} />
        </div>

        <div id={idDetalle} data-abierto={abierta} className="despliegue">
          <div inert={!abierta} className="despliegue-interior">
            <div className="mt-8 grid gap-8 border-t border-borde-campo pt-8 escritorio:grid-cols-[7fr_5fr] escritorio:gap-10">
              <div className="grid max-w-xl content-start gap-3.5">
                {historia.parrafos.map((parrafo) => (
                  <p key={parrafo} className="text-parrafo">
                    {parrafo}
                  </p>
                ))}
              </div>
              <ul aria-label={textos.aportes} className="grid content-start gap-3.5">
                {historia.personas.map((persona) => (
                  <li key={persona.nombre} className="rounded-2xl bg-tarjeta px-[1.125rem] py-3.5">
                    <p className="font-medium">{persona.nombre}</p>
                    <p className="text-cuerpo">{persona.aporte}</p>
                  </li>
                ))}
              </ul>
              <p className="text-nota escritorio:col-span-2">
                {textos.fuente}:{' '}
                <a href={historia.fuente.href} target="_blank" rel="noopener noreferrer" className={`underline underline-offset-4 ${areaTactil} ${foco}`}>
                  {historia.fuente.texto}{' '}
                  <span className="sr-only">({textos.fuenteNueva})</span>
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 pt-10 escritorio:px-12">
        <PasosHistorias pasos={historias.map(({ clave, nombre, combinacion }) => ({ clave, nombre, combinacion }))} activa={activa} alElegir={irA} etiqueta={textos.etiquetaLista} idBase={id} idPanel={idPanel} />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-5 px-6 pb-16 pt-10 escritorio:px-12 escritorio:pb-24">
        <p className="text-titulo-tarjeta">{textos.cierre}</p>
        <EnlaceBoton href={hrefBoton}>{textoBoton}</EnlaceBoton>
      </div>
    </section>
  )
}
