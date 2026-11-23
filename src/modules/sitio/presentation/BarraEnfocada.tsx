import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

type Props = {
  logoSrc: string
  logoAlt: string
  hrefInicio: string
  /** Lo que va a la derecha del logo (el selector de idioma, el progreso…); sin nada, la barra solo lleva el logo */
  derecha?: ReactNode
}

// Barra de las pantallas de una sola tarea: solo el logo, que vuelve al inicio, y lo que cada pantalla quiera poner a la
// derecha. Sin navegación, para que la persona termine lo que empezó.
export function BarraEnfocada({ logoSrc, logoAlt, hrefInicio, derecha }: Props) {
  return (
    <header className="border-b border-borde bg-fondo">
      <div className="flex min-h-20 w-full flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4 md:px-12">
        <Link
          href={hrefInicio}
          className="inline-flex focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primario"
        >
          <Image src={logoSrc} alt={logoAlt} width={210} height={40} unoptimized priority className="h-10 w-auto" />
        </Link>
        {derecha}
      </div>
    </header>
  )
}
