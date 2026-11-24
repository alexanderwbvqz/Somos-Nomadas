'use client'

import { useState } from 'react'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { Badge } from '@/shared/ui/Badge'
import {
  areaDeEjemplo,
  areasMatch,
  CONEXIONES_POR_AREA_COMPLEMENTARIA,
  conexionesPorArea,
  totalConexiones,
  type ClaveArea,
} from '../../domain/match'
import { colorArea } from './coloresArea'

export type TextosPanelMatch = {
  titulo: string
  insignia: string
  etiquetaSelector: string
  etiquetaPropia: string
  etiquetaCantidad: string
  etiquetaConexion: string
  afinidad: string
  pregunta: string
  notaEjemplo: string
}

type Props = {
  textos: TextosPanelMatch
  nombresAreas: Record<ClaveArea, string>
}

const ranuras = Array.from({ length: CONEXIONES_POR_AREA_COMPLEMENTARIA }, (_, indice) => indice)

// Panel que muestra cómo se arma la lista de conexiones según el área de quien consulta:
// 1 de su misma área y hasta 3 de cada una de las demás.
export function PanelMatch({ textos, nombresAreas }: Props) {
  const [propia, setPropia] = useState<ClaveArea>('tecnologia')
  const conexiones = conexionesPorArea(propia)
  const total = totalConexiones(propia)

  return (
    <div className="sombra-panel rounded-2xl bg-tarjeta p-6 escritorio:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-titulo-tarjeta">{textos.titulo}</h3>
        <Badge>{rellenarPlantilla(textos.insignia, { total })}</Badge>
      </div>

      <div role="group" aria-label={textos.etiquetaSelector} className="mt-5 border-b border-borde/15 pb-5">
        <p className="text-etiqueta-chica">{textos.etiquetaSelector}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {areasMatch.map((area) => (
            <button
              key={area}
              type="button"
              aria-pressed={propia === area}
              onClick={() => setPropia(area)}
              className={`text-etiqueta-chica rounded-full border-2 border-texto px-3.5 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario ${
                propia === area ? 'bg-texto text-fondo' : 'text-texto hover:bg-suave'
              }`}
            >
              {nombresAreas[area]}
            </button>
          ))}
        </div>
      </div>

      <ul>
        {areasMatch.map((area) => {
          const cantidad = conexiones[area]
          const esPropia = area === propia
          return (
            <li key={area} className="mt-5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-cuerpo flex items-center gap-2 font-medium">
                  <span aria-hidden="true" className={`size-2.5 rounded-full border border-texto/30 ${colorArea[area]}`} />
                  {nombresAreas[area]}
                  {esPropia && <span className="text-nota font-normal">({textos.etiquetaPropia})</span>}
                </p>
                <p className="text-etiqueta-chica">
                  {esPropia ? cantidad : rellenarPlantilla(textos.etiquetaCantidad, { cantidad })}
                </p>
              </div>
              <div aria-hidden="true" className="mt-2 flex gap-1.5">
                {ranuras.map((ranura) => (
                  <span key={ranura} className={`h-4 flex-1 rounded-md ${ranura < cantidad ? colorArea[area] : 'bg-suave'}`} />
                ))}
              </div>
            </li>
          )
        })}
      </ul>

      <p
        aria-live="polite"
        className="text-etiqueta-chica mt-5 flex items-center justify-between gap-3 border-t border-dashed border-borde/30 pt-4"
      >
        <span>{areasMatch.map((area) => conexiones[area]).join(' + ')}</span>
        <span>= {total}</span>
      </p>

      <div className="fondo-ejemplo mt-6 rounded-xl border border-borde/15 px-5 py-4">
        <div className="text-etiqueta-chica flex flex-wrap items-center justify-between gap-3">
          <span>{rellenarPlantilla(textos.etiquetaConexion, { area: nombresAreas[areaDeEjemplo(propia)] })}</span>
          <Badge>{textos.afinidad}</Badge>
        </div>
        <p className="text-titulo-tarjeta mt-3">{textos.pregunta}</p>
      </div>
      <p className="text-nota mt-4">{rellenarPlantilla(textos.notaEjemplo, { area: nombresAreas[propia] })}</p>
    </div>
  )
}
