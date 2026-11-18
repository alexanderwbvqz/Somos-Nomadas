import { Badge } from '@/shared/ui/Badge'
import type { ClaveArea } from '../../domain/match'
import { PanelMatch, type TextosPanelMatch } from '../ui/PanelMatch'

export type SeccionMatchProps = {
  textos: {
    etiqueta: string
    tituloInicio: string
    tituloResaltado: string
    parrafo: string
    puntos: string[]
    panel: TextosPanelMatch
  }
  nombresAreas: Record<ClaveArea, string>
}

export function SeccionMatch({ textos, nombresAreas }: SeccionMatchProps) {
  return (
    <section
      aria-labelledby="titulo-match"
      className="mx-auto grid w-full max-w-7xl items-center gap-10 border-t border-borde/25 px-6 py-16 escritorio:grid-cols-12 escritorio:gap-12 escritorio:px-12 escritorio:py-24"
    >
      <div className="escritorio:col-span-5">
        <Badge>{textos.etiqueta}</Badge>
        <h2 id="titulo-match" className="text-titulo-medio mt-5">
          {textos.tituloInicio} <em className="italic">{textos.tituloResaltado}</em>
        </h2>
        <p className="text-parrafo mt-6 max-w-lg">{textos.parrafo}</p>
        <ul className="mt-7 flex max-w-lg flex-col gap-4">
          {textos.puntos.map((punto) => (
            <li key={punto} className="text-parrafo flex gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-texto"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 12 5 5 9-10" />
                </svg>
              </span>
              <span>{punto}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="escritorio:col-span-7">
        <PanelMatch textos={textos.panel} nombresAreas={nombresAreas} />
      </div>
    </section>
  )
}
