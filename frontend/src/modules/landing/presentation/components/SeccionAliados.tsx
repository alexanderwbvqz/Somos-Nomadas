import Image from 'next/image'
import { Badge } from '@/shared/ui/Badge'
import { EnlaceBoton } from '@/shared/ui/EnlaceBoton'

export type TipoAliadoVista = {
  clave: string
  numero: string
  nombre: string
  descripcion: string
  enlace: string
  href: string
  /** Texto "2 activos"; solo si hay aliados de ese tipo */
  activos?: string
}

export type AliadoActivo = { nombre: string; logoSrc?: string }

export type SeccionAliadosProps = {
  textos: {
    etiqueta: string
    tituloInicio: string
    tituloResaltado: string
    parrafo: string
    botonAliado: string
    enlaceRed: string
    nota: string
    etiquetaActivos: string
  }
  tipos: TipoAliadoVista[]
  activos: AliadoActivo[]
  hrefAliado: string
  hrefRed: string
}

export function SeccionAliados({ textos, tipos, activos, hrefAliado, hrefRed }: SeccionAliadosProps) {
  return (
    <section
      aria-labelledby="titulo-aliados"
      className="mx-auto grid w-full max-w-7xl gap-10 border-t border-borde/25 px-6 py-16 escritorio:grid-cols-12 escritorio:gap-16 escritorio:px-12 escritorio:py-24"
    >
      <div className="escritorio:col-span-5">
        <Badge>{textos.etiqueta}</Badge>
        <h2 id="titulo-aliados" className="text-titulo-medio mt-5">
          {textos.tituloInicio} <em className="italic">{textos.tituloResaltado}</em>
        </h2>
        <p className="text-parrafo mt-6 max-w-lg">{textos.parrafo}</p>
        <div className="mt-9 flex flex-col items-start gap-5">
          <EnlaceBoton href={hrefAliado} variante="lleno">
            {textos.botonAliado}
          </EnlaceBoton>
          <EnlaceBoton href={hrefRed} variante="enlace">
            {textos.enlaceRed}
          </EnlaceBoton>
        </div>
        <p className="text-cuerpo mt-7 flex max-w-md items-start gap-2.5">
          <span
            aria-hidden="true"
            className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-texto"
          >
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12 5 5 9-10" />
            </svg>
          </span>
          {textos.nota}
        </p>
      </div>

      <ul className="escritorio:col-span-7">
        {tipos.map((tipo) => (
          <li
            key={tipo.clave}
            className="fondo-fila flex flex-col gap-4 border-t-[1.5px] border-texto px-2 py-7 last:border-b-[1.5px] escritorio:flex-row escritorio:gap-5 escritorio:px-4"
          >
            <p aria-hidden="true" className="text-etiqueta-chica pt-3 escritorio:w-14 escritorio:shrink-0">
              {tipo.numero}
            </p>
            <div className="flex-1">
              <h3 className="text-titulo-tarjeta-grande">{tipo.nombre}</h3>
              <p className="text-parrafo mt-2 max-w-lg">{tipo.descripcion}</p>
            </div>
            <div className="flex flex-col items-start gap-2 escritorio:items-end escritorio:self-center">
              {tipo.activos && <p className="text-etiqueta-chica">{tipo.activos}</p>}
              <EnlaceBoton href={tipo.href} variante="enlace">
                {tipo.enlace}
              </EnlaceBoton>
            </div>
          </li>
        ))}
      </ul>

      {activos.length > 0 && (
        <div className="border-t border-dashed border-borde/30 pt-9 escritorio:col-span-12">
          <p className="text-etiqueta-chica">{textos.etiquetaActivos}</p>
          <ul className="mt-5 flex flex-wrap items-center gap-x-10 gap-y-4">
            {activos.map((aliado) => (
              <li key={aliado.nombre}>
                {aliado.logoSrc ? (
                  <Image src={aliado.logoSrc} alt={aliado.nombre} width={160} height={32} unoptimized className="h-8 w-auto" />
                ) : (
                  <span className="text-parrafo font-serif">{aliado.nombre}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
