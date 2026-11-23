import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/shared/ui/Badge'
import { foco } from '@/shared/ui/EnlaceBoton'

export type EnlaceCuenta = {
  id: string
  etiqueta: string
  /** Sin dirección es que esa página todavía no existe: se muestra apagada y con la insignia «Pronto» */
  href?: string
  activo?: boolean
}

export type PerfilCuenta = {
  etiqueta: string
  href: string
  /** Vacías si no se sabe el nombre: entonces no se dibuja el círculo */
  iniciales: string
  activo?: boolean
}

export type BarraCuentaProps = {
  logoSrc: string
  logoAlt: string
  hrefInicio: string
  /** Nombre accesible de la lista de secciones */
  etiquetaNavegacion: string
  enlaces: EnlaceCuenta[]
  /** El texto de la insignia de lo que todavía no existe */
  pronto: string
  perfil: PerfilCuenta
}

const claseItem = 'text-etiqueta inline-flex items-center gap-2 rounded-full px-4 py-1.5 min-h-9'

// Barra de las páginas de la cuenta de la persona (perfil, descubrir, conversaciones…): el logo, las secciones y, a la derecha,
// su perfil. Las secciones se ven solo en pantallas anchas; el logo y el perfil, siempre.
export function BarraCuenta({ logoSrc, logoAlt, hrefInicio, etiquetaNavegacion, enlaces, pronto, perfil }: BarraCuentaProps) {
  return (
    <header className="border-b border-borde bg-fondo">
      <div className="grid min-h-20 w-full grid-cols-[1fr_auto] items-center gap-x-6 px-6 py-4 md:px-12 escritorio:grid-cols-[1fr_auto_1fr]">
        <Link href={hrefInicio} className="inline-flex justify-self-start focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primario">
          <Image src={logoSrc} alt={logoAlt} width={210} height={40} unoptimized priority className="h-10 w-auto" />
        </Link>

        <nav aria-label={etiquetaNavegacion} className="hidden escritorio:block">
          <ul className="flex gap-1 rounded-full border-[1.5px] border-texto/20 bg-tarjeta p-1">
            {enlaces.map((enlace) => (
              <li key={enlace.id}>
                {enlace.href ? (
                  <Link
                    href={enlace.href}
                    aria-current={enlace.activo ? 'page' : undefined}
                    className={`${claseItem} ${foco} ${enlace.activo ? 'bg-texto text-fondo' : 'hover:bg-suave'}`}
                  >
                    {enlace.etiqueta}
                  </Link>
                ) : (
                  <span aria-disabled="true" className={`${claseItem} cursor-not-allowed opacity-60`}>
                    {enlace.etiqueta}
                    <Badge>{pronto}</Badge>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href={perfil.href}
          aria-current={perfil.activo ? 'page' : undefined}
          className={`text-etiqueta inline-flex items-center gap-2.5 justify-self-end rounded-full bg-texto py-1.5 pr-5 text-fondo ${perfil.iniciales ? 'pl-1.5' : 'pl-5'} ${foco}`}
        >
          {perfil.iniciales && (
            <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full bg-fondo font-serif text-[0.9375rem] normal-case tracking-normal text-texto">
              {perfil.iniciales}
            </span>
          )}
          {perfil.etiqueta}
        </Link>
      </div>
    </header>
  )
}
