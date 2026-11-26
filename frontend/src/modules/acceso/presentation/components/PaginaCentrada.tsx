'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { IconoEstado } from '../ui/IconoEstado'

type Props = {
  icono: 'confirmado' | 'aviso' | 'espera'
  etiqueta: string
  titulo: string
  parrafo?: string
  /** Debajo del texto: un botón o un formulario */
  children?: ReactNode
}

// Maqueta de una pantalla corta: una sola columna centrada en el alto que queda bajo la barra, con un icono arriba.
// Para pantallas de un solo mensaje (como confirmar el correo), donde las dos columnas de PaginaAcceso quedan vacías.
export function PaginaCentrada({ icono, etiqueta, titulo, parrafo, children }: Props) {
  const encabezado = useRef<HTMLHeadingElement>(null)

  // Cuando cambia el estado (cambia el título), el foco va al título para que se anuncie
  useEffect(() => {
    encabezado.current?.focus()
  }, [titulo])

  return (
    <div className="mx-auto flex w-full max-w-[39rem] flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <IconoEstado estado={icono} />
      <p className="text-etiqueta-chica mt-7">{etiqueta}</p>
      <h1 ref={encabezado} tabIndex={-1} className="text-titulo-medio texto-equilibrado mt-5 outline-none">
        {titulo}
      </h1>
      {parrafo && <p className="text-parrafo-grande mt-5 text-texto-suave">{parrafo}</p>}
      {children && <div className="mt-9 flex w-full flex-col items-center">{children}</div>}
    </div>
  )
}
