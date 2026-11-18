import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Badge } from '@/shared/ui/Badge'

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
  /** Selector de idioma, ya construido por quien usa el pie */
  selectorIdioma: ReactNode
}

const foco = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primario'

// Pie oscuro de la web: marca, columnas de enlaces, aviso de privacidad, copyright e idioma.
export function Pie({ logoSrc, logoAlt, hrefInicio, descripcion, insignia, columnas, aviso, copyright, selectorIdioma }: Props) {
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
          <div className="mt-7 flex flex-wrap items-center justify-between gap-5">
            <p className="text-cuerpo">{copyright}</p>
            {selectorIdioma}
          </div>
        </div>
      </div>
    </footer>
  )
}
