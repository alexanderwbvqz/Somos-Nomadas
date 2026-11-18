import Image from 'next/image'
import Link from 'next/link'

export type EnlaceBarra = { texto: string; href: string }

type Props = {
  logoSrc: string
  logoAlt: string
  hrefInicio: string
  etiquetaNavegacion: string
  enlaces: EnlaceBarra[]
}

export function BarraSuperior({ logoSrc, logoAlt, hrefInicio, etiquetaNavegacion, enlaces }: Props) {
  return (
    <header className="border-b border-borde bg-fondo">
      <div className="flex h-20 w-full items-center justify-between px-6 md:px-12">
        <Link
          href={hrefInicio}
          className="inline-flex focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primario"
        >
          <Image src={logoSrc} alt={logoAlt} width={210} height={40} unoptimized priority className="h-10 w-auto" />
        </Link>
        <nav aria-label={etiquetaNavegacion}>
          <ul className="flex items-center gap-8">
            {enlaces.map((enlace) => (
              <li key={enlace.href}>
                <Link
                  href={enlace.href}
                  className="text-etiqueta inline-flex items-center gap-3 text-texto focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primario"
                >
                  {enlace.texto}
                  <span aria-hidden="true">+</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
