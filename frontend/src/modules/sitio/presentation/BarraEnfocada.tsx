import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

type Props = {
  logoSrc: string
  logoAlt: string
  hrefInicio: string
  /** Lo que va en el centro (por ejemplo el progreso de los pasos); en pantallas estrechas baja a una segunda línea */
  centro?: ReactNode
  /** Lo que va a la derecha del logo (por ejemplo "Saltar por ahora"); sin nada, la barra solo lleva el logo */
  derecha?: ReactNode
}

// Barra de las pantallas de una sola tarea: solo el logo, que vuelve al inicio, y lo que cada pantalla quiera poner en el
// centro y a la derecha. Sin navegación, para que la persona termine lo que empezó.
export function BarraEnfocada({ logoSrc, logoAlt, hrefInicio, centro, derecha }: Props) {
  return (
    <header className="border-b border-borde bg-fondo">
      <div className="grid min-h-20 w-full grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3 px-6 py-4 md:px-12 escritorio:grid-cols-[1fr_auto_1fr]">
        <Link
          href={hrefInicio}
          className="inline-flex justify-self-start focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primario"
        >
          <Image src={logoSrc} alt={logoAlt} width={210} height={40} unoptimized priority className="h-10 w-auto" />
        </Link>
        {centro && <div className="col-span-2 row-start-2 justify-self-start escritorio:col-span-1 escritorio:col-start-2 escritorio:row-start-1 escritorio:justify-self-center">{centro}</div>}
        {derecha && <div className="col-start-2 row-start-1 justify-self-end escritorio:col-start-3">{derecha}</div>}
      </div>
    </header>
  )
}
