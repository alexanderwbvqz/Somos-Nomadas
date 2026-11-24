import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Badge } from '@/shared/ui/Badge'
import { areaTactil, foco } from '@/shared/ui/EnlaceBoton'

export type ColumnaPie = { id: string; titulo: string; enlaces: { texto: string; href: string }[] }

type Props = {
  logoSrc: string
  logoAlt: string
  hrefInicio: string
  descripcion: string
  insignia: string
  columnas: ColumnaPie[]
  aviso: { antes: string; textoEnlace: string; despues: string; href: string }
  copyright: string
  /** Enlace de contacto (se abre en pestaña nueva) */
  contacto: { texto: string; href: string }
  /** Redes sociales; si la lista está vacía no se muestran */
  redes: { nombre: string; href: string; icono: ReactNode }[]
  /** Nombre accesible de la lista de redes */
  etiquetaRedes: string
  /** Selector de idioma, ya construido por quien usa el pie */
  selectorIdioma: ReactNode
}


// Pie oscuro de la web: marca, columnas de enlaces, aviso de privacidad, copyright e idioma.
export function Pie({
  logoSrc,
  logoAlt,
  hrefInicio,
  descripcion,
  insignia,
  columnas,
  aviso,
  copyright,
  contacto,
  redes,
  etiquetaRedes,
  selectorIdioma,
}: Props) {
  return (
    <footer className="bg-texto text-fondo">
      <div className="mx-auto w-full max-w-7xl px-6 pb-8 pt-14 escritorio:px-12 escritorio:pb-10 escritorio:pt-[4.5rem]">
        <div className="grid gap-10 sm:grid-cols-2 escritorio:grid-cols-12">
          <div className="sm:col-span-2 escritorio:col-span-4">
            <Link href={hrefInicio} className={`inline-flex ${foco}`}>
              <Image src={logoSrc} alt={logoAlt} width={210} height={40} unoptimized className="h-10 w-auto" />
            </Link>
            <p className="text-parrafo mt-6 max-w-sm">{descripcion}</p>
            <div className="mt-6">
              <Badge>
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="size-2 rounded-full bg-primario" />
                  {insignia}
                </span>
              </Badge>
            </div>
          </div>

          <div className="grid gap-10 sm:col-span-2 sm:grid-cols-3 sm:gap-8 escritorio:col-span-8">
            {columnas.map((columna) => (
              <nav key={columna.id} aria-labelledby={`pie-${columna.id}`}>
                <p id={`pie-${columna.id}`} className="text-etiqueta-chica opacity-60">
                  {columna.titulo}
                </p>
                <ul className="mt-5 flex flex-col gap-4">
                  {columna.enlaces.map((enlace) => (
                    <li key={enlace.href}>
                      <Link
                        href={enlace.href}
                        className={`text-etiqueta hover:underline hover:underline-offset-8 ${foco}`}
                      >
                        {enlace.texto}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 border-t border-fondo/35 pt-7">
          <p className="text-cuerpo max-w-2xl opacity-85">
            {aviso.antes}{' '}
            <Link href={aviso.href} className={`underline underline-offset-4 ${foco}`}>
              {aviso.textoEnlace}
            </Link>
            {aviso.despues}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-x-8 gap-y-5">
            <p className="text-cuerpo">{copyright}</p>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
              <a
                href={contacto.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-etiqueta ${areaTactil} underline underline-offset-8 ${foco}`}
              >
                {contacto.texto} <span aria-hidden="true">↗</span>
              </a>
              {redes.length > 0 && (
                <ul aria-label={etiquetaRedes} className="flex gap-2.5">
                  {redes.map((red) => (
                    <li key={red.nombre}>
                      <a
                        href={red.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={red.nombre}
                        className={`inline-flex size-10 items-center justify-center rounded-full border-[1.5px] border-fondo/55 hover:bg-fondo hover:text-texto ${foco}`}
                      >
                        {red.icono}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {selectorIdioma}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
