import type { ReactNode } from 'react'

// Lo que comparten los campos de formulario: las clases del control y cómo se enlazan la ayuda y el error con él.

export const claseControl =
  'w-full rounded-xl bg-tarjeta px-4 py-3 text-base text-texto placeholder:text-texto-tenue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario'
export const bordeNormal = 'border-[1.5px] border-borde-campo'
export const bordeError = 'border-2 border-primario'

export type CampoBase = {
  /** El control tiene id `campo-{clave}` */
  clave: string
  etiqueta: ReactNode
  extraEtiqueta?: ReactNode
  ayuda?: ReactNode
  error?: string
}

export function descripcion(clave: string, ayuda: unknown, error: unknown): string | undefined {
  const ids = [ayuda ? `ayuda-${clave}` : undefined, error ? `error-${clave}` : undefined].filter(Boolean)
  return ids.length > 0 ? ids.join(' ') : undefined
}
