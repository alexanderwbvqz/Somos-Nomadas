'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Props = {
  idiomaActual: string
  opciones: { codigo: string; nombre: string }[]
  /** Nombre accesible de la navegación */
  etiqueta: string
}

// Cambia solo el primer tramo de la URL (el idioma) y conserva el resto de la ruta.
export function SelectorIdioma({ idiomaActual, opciones, etiqueta }: Props) {
  const ruta = usePathname() ?? ''
  const resto = ruta.split('/').slice(2).join('/')

  return (
    <nav aria-label={etiqueta}>
      <ul className="text-etiqueta-chica flex flex-wrap items-center gap-x-5 gap-y-2">
        <li aria-hidden="true" className="text-fondo-tenue">
          {etiqueta}
        </li>
        {opciones.map((opcion) => (
          <li key={opcion.codigo}>
            {opcion.codigo === idiomaActual ? (
              <span aria-current="true" lang={opcion.codigo} className="underline underline-offset-8">
                {opcion.nombre}
              </span>
            ) : (
              <Link
                href={`/${opcion.codigo}${resto ? `/${resto}` : ''}`}
                lang={opcion.codigo}
                hrefLang={opcion.codigo}
                className="text-fondo-tenue hover:text-fondo hover:underline hover:underline-offset-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primario"
              >
                {opcion.nombre}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
