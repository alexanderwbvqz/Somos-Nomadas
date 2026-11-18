import { Badge } from '@/shared/ui/Badge'
import { EnlaceBoton } from '@/shared/ui/EnlaceBoton'
import type { ClaveArea } from '../../domain/match'
import { colorArea } from '../ui/coloresArea'
import { IconoArea } from '../ui/IconoArea'

export type AreaPilar = {
  clave: ClaveArea
  nombre: string
  aporta: string
  descripcion: string
  claves: string[]
  hrefPostular: string
  hrefPerfiles: string
}

export type SeccionPilaresProps = {
  textos: {
    etiqueta: string
    tituloInicio: string
    tituloResaltado: string
    parrafo: string
    estado: string
    botonPostular: string
    enlacePerfiles: string
  }
  areas: AreaPilar[]
}

export function SeccionPilares({ textos, areas }: SeccionPilaresProps) {
  return (
    <section
      aria-labelledby="titulo-pilares"
      className="mx-auto w-full max-w-7xl border-t border-borde/25 px-6 py-16 escritorio:px-12 escritorio:py-24"
    >
      <header className="flex flex-wrap items-end justify-between gap-8">
        <div className="max-w-4xl">
          <Badge>{textos.etiqueta}</Badge>
          <h2 id="titulo-pilares" className="text-titulo-medio mt-5">
            {textos.tituloInicio} <em className="italic">{textos.tituloResaltado}</em>
          </h2>
          <p className="text-parrafo mt-5 max-w-3xl">{textos.parrafo}</p>
        </div>
        <Badge>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="size-2 rounded-full bg-primario" />
            {textos.estado}
          </span>
        </Badge>
      </header>

      <ul className="mt-14 grid gap-5 sm:grid-cols-2 escritorio:grid-cols-4">
        {areas.map((area) => (
          <li key={area.clave} className="fondo-tarjeta flex flex-col rounded-2xl">
            <div className="flex flex-1 flex-col px-6 pb-2 pt-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-titulo-tarjeta-grande">{area.nombre}</h3>
                <span
                  className={`inline-flex size-12 shrink-0 items-center justify-center rounded-full ${colorArea[area.clave]}`}
                >
                  <IconoArea area={area.clave} />
                </span>
              </div>
              <p className="text-etiqueta-chica mt-3">{area.aporta}</p>
              <p className="text-cuerpo mt-4">{area.descripcion}</p>
              <ul className="mt-5 flex flex-wrap gap-1.5">
                {area.claves.map((clave) => (
                  <li key={clave} className="text-nota rounded-full border border-borde/30 px-2.5 py-0.5">
                    {clave}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-start gap-4 p-6">
              <EnlaceBoton href={area.hrefPostular} variante="lleno">
                {textos.botonPostular}
              </EnlaceBoton>
              <EnlaceBoton href={area.hrefPerfiles} variante="enlace">
                {textos.enlacePerfiles}
              </EnlaceBoton>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
