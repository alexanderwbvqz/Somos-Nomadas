'use client'

import { useState } from 'react'
import type { ClaveArea } from '../../domain/match'

export type TextosDiagrama = {
  descripcion: string
  pie: string
  tecnologia: string
  marketing: string
  operaciones: string
  finanzas: string
  equipo: string
  /** Lo que aporta cada área; se muestra al resaltarla */
  roles: Record<ClaveArea, string>
}

// Cada área: su círculo y su etiqueta. Los colores salen de los tokens (fill-… / stroke-…).
const areas: {
  clave: ClaveArea
  cx: number
  cy: number
  relleno: string
  etiqueta: { x: number; y: number; ancho: number }
  retraso: string
}[] = [
  { clave: 'tecnologia', cx: 125, cy: 125, relleno: 'fill-degradado-amarillo', etiqueta: { x: 26, y: 54, ancho: 104 }, retraso: '0s' },
  { clave: 'marketing', cx: 195, cy: 125, relleno: 'fill-degradado-azul mix-blend-multiply', etiqueta: { x: 170, y: 54, ancho: 130 }, retraso: '-2s' },
  { clave: 'operaciones', cx: 125, cy: 195, relleno: 'fill-degradado-durazno mix-blend-multiply', etiqueta: { x: 22, y: 244, ancho: 112 }, retraso: '-4s' },
  { clave: 'finanzas', cx: 195, cy: 195, relleno: 'fill-primario/50 mix-blend-multiply', etiqueta: { x: 190, y: 244, ancho: 90 }, retraso: '-5.5s' },
]

// Cuatro círculos que se superponen (uno por área); donde se cruzan nace el equipo.
// Al pasar el cursor, enfocar o tocar una etiqueta, esa área se resalta y el pie dice qué aporta.
export function DiagramaAreas({ textos }: { textos: TextosDiagrama }) {
  const [sobre, setSobre] = useState<ClaveArea | null>(null)
  const [fijada, setFijada] = useState<ClaveArea | null>(null)
  const activa = sobre ?? fijada

  return (
    <figure className="mx-auto w-full max-w-lg escritorio:mx-0 escritorio:max-w-none">
      <svg viewBox="10 28 300 264" role="img" aria-label={textos.descripcion} className="w-full">
        {areas.map((area) => (
          <circle
            key={area.clave}
            cx={area.cx}
            cy={area.cy}
            r="88"
            style={{ '--retraso': area.retraso } as React.CSSProperties}
            className={`flotar transicion-suave ${area.relleno} ${activa && activa !== area.clave ? 'opacity-25' : ''}`}
          />
        ))}

        {areas.map((area) => {
          const resaltada = activa === area.clave
          return (
            <g
              key={area.clave}
              role="button"
              tabIndex={0}
              aria-pressed={fijada === area.clave}
              aria-label={textos[area.clave]}
              className="group cursor-pointer outline-none"
              onPointerEnter={(evento) => evento.pointerType === 'mouse' && setSobre(area.clave)}
              onPointerLeave={() => setSobre(null)}
              onFocus={() => setSobre(area.clave)}
              onBlur={() => setSobre(null)}
              onClick={() => setFijada(fijada === area.clave ? null : area.clave)}
              onKeyDown={(evento) => {
                if (evento.key === 'Enter' || evento.key === ' ') {
                  evento.preventDefault()
                  setFijada(fijada === area.clave ? null : area.clave)
                }
              }}
            >
              <rect
                x={area.etiqueta.x}
                y={area.etiqueta.y}
                width={area.etiqueta.ancho}
                height="22"
                rx="11"
                strokeWidth="0.8"
                className={`transicion-suave stroke-texto group-focus-visible:stroke-primario ${resaltada ? 'fill-texto' : 'fill-fondo'}`}
              />
              <text
                x={area.etiqueta.x + area.etiqueta.ancho / 2}
                y={area.etiqueta.y + 14.5}
                textAnchor="middle"
                className={`texto-diagrama transicion-suave ${resaltada ? 'fill-fondo' : 'fill-texto'}`}
              >
                {textos[area.clave]}
              </text>
            </g>
          )
        })}

        <circle cx="160" cy="160" r="30" className="fill-fondo stroke-texto" strokeWidth="0.8" />
        <text x="160" y="166" textAnchor="middle" className="texto-diagrama-centro fill-texto">
          {textos.equipo}
        </text>
      </svg>
      <figcaption aria-live="polite" className="text-nota min-h-12 text-center escritorio:text-left">
        {activa ? (
          <>
            <strong className="font-medium">{textos[activa]}:</strong> {textos.roles[activa]}
          </>
        ) : (
          textos.pie
        )}
      </figcaption>
    </figure>
  )
}
