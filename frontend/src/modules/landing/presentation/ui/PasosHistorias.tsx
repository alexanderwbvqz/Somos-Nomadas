'use client'

import { useRef, type KeyboardEvent } from 'react'
import { foco } from '@/shared/ui/EnlaceBoton'

export type PasoHistoria = { clave: string; nombre: string; combinacion: string }

type Props = {
  pasos: PasoHistoria[]
  activa: number
  alElegir: (indice: number) => void
  /** Nombre accesible de la lista de pestañas */
  etiqueta: string
  /** El id de la pestaña `n` es `idPestanaHistoria(idBase, n)`; lo usa quien arma el panel para nombrarlo */
  idBase: string
  /** El id del panel que muestra la historia elegida */
  idPanel: string
}

export function idPestanaHistoria(idBase: string, indice: number): string {
  return `${idBase}-pestana-${indice}`
}

// Las historias como pestañas: una línea que se rellena en la activa, su nombre y qué se combinó en ella. Con Tab entra solo la
// activa; las flechas, Inicio y Fin recorren las demás y llevan el foco con ellas.
export function PasosHistorias({ pasos, activa, alElegir, etiqueta, idBase, idPanel }: Props) {
  const pestanas = useRef<(HTMLButtonElement | null)[]>([])

  function elegir(indice: number) {
    alElegir(indice)
    pestanas.current[indice]?.focus()
  }

  function alPulsarTecla(evento: KeyboardEvent, indice: number) {
    const total = pasos.length
    const destino =
      evento.key === 'ArrowRight' || evento.key === 'ArrowDown'
        ? (indice + 1) % total
        : evento.key === 'ArrowLeft' || evento.key === 'ArrowUp'
          ? (indice - 1 + total) % total
          : evento.key === 'Home'
            ? 0
            : evento.key === 'End'
              ? total - 1
              : undefined
    if (destino === undefined) return
    evento.preventDefault()
    elegir(destino)
  }

  return (
    <div role="tablist" aria-label={etiqueta} className="grid grid-flow-col auto-cols-[minmax(7rem,1fr)] gap-3.5 overflow-x-auto pb-2 escritorio:overflow-visible">
      {pasos.map((paso, indice) => {
        const esActiva = indice === activa
        return (
          <button
            key={paso.clave}
            ref={(boton) => {
              pestanas.current[indice] = boton
            }}
            type="button"
            role="tab"
            id={idPestanaHistoria(idBase, indice)}
            aria-selected={esActiva}
            aria-controls={idPanel}
            tabIndex={esActiva ? 0 : -1}
            onClick={() => alElegir(indice)}
            onKeyDown={(evento) => alPulsarTecla(evento, indice)}
            className={`group grid cursor-pointer content-start gap-2.5 text-left ${foco}`}
          >
            <span aria-hidden="true" className="relative block h-[3px] w-full overflow-hidden rounded-full bg-borde-campo">
              <span data-activo={esActiva} className="relleno-progreso absolute inset-0 block bg-texto" />
            </span>
            <span className={`text-titulo-tarjeta transicion-suave ${esActiva ? 'text-texto' : 'text-texto-suave group-hover:text-texto'}`}>{paso.nombre}</span>
            <span className="text-etiqueta-chica">{paso.combinacion}</span>
          </button>
        )
      })}
    </div>
  )
}
