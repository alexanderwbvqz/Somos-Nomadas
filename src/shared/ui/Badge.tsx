import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** suave: fondo claro (por defecto) · oscuro: fondo oscuro, para destacar una etiqueta */
  tono?: 'suave' | 'oscuro'
}

const clasesTono = { suave: 'bg-suave text-texto', oscuro: 'bg-texto text-fondo' } as const

// Una etiqueta es siempre un Badge con un tono (data-tono).
export function Badge({ children, tono = 'suave' }: Props) {
  return (
    <span data-tono={tono} className={`text-etiqueta-chica inline-block rounded-full px-3 py-1 ${clasesTono[tono]}`}>
      {children}
    </span>
  )
}
