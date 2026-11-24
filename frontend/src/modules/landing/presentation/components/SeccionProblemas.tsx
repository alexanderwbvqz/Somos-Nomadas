import { Badge } from '@/shared/ui/Badge'
import { DiagramaAreas, type TextosDiagrama } from '../ui/DiagramaAreas'

export type ItemProblema = {
  clave: string
  tema: string
  titulo: string
  problema: string
  solucion: string
}

export type SeccionProblemasProps = {
  textos: {
    tituloInicio: string
    tituloFin: string
    subtitulo: string
    etiquetaProblema: string
    etiquetaSolucion: string
    diagrama: TextosDiagrama
  }
  items: ItemProblema[]
}

export function SeccionProblemas({ textos, items }: SeccionProblemasProps) {
  return (
    <section
      aria-labelledby="titulo-problemas"
      className="mx-auto w-full max-w-7xl px-6 py-16 escritorio:px-12 escritorio:py-20"
    >
      <header>
        <h2 id="titulo-problemas" className="text-titulo">
          <span className="block">{textos.tituloInicio}</span>
          <span className="block">{textos.tituloFin}</span>
        </h2>
        <p className="text-parrafo mt-6 max-w-3xl">{textos.subtitulo}</p>
      </header>

      <div className="mt-12 grid gap-10 escritorio:grid-cols-12 escritorio:gap-12">
        {/* El diagrama queda fijo mientras se recorren las tarjetas */}
        <div className="escritorio:sticky escritorio:top-8 escritorio:col-span-6 escritorio:self-start">
          <DiagramaAreas textos={textos.diagrama} />
        </div>

        <ul className="flex flex-col gap-4 escritorio:col-span-6">
          {items.map((item) => (
            <li key={item.clave} className="fondo-tarjeta rounded-xl px-6 py-5">
              <div className="text-etiqueta-chica flex flex-wrap items-center justify-between gap-3">
                <span>{item.tema}</span>
                <Badge>{textos.etiquetaProblema}</Badge>
              </div>
              <h3 className="text-titulo-tarjeta mt-2">{item.titulo}</h3>
              <p className="text-parrafo mt-3">{item.problema}</p>
              <div className="mt-4 border-t border-borde/25 pt-4">
                <p className="text-etiqueta-chica">✓ {textos.etiquetaSolucion}</p>
                <p className="text-parrafo mt-1">{item.solucion}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
