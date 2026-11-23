import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** suave: fondo claro (por defecto) · oscuro: fondo oscuro, para destacar una etiqueta · borde: solo contorno */
  tono?: 'suave' | 'oscuro' | 'borde'
  /** etiqueta: letra pequeña en mayúsculas (por defecto) · respuesta: lo que alguien contestó, en letra de lectura */
  formato?: 'etiqueta' | 'respuesta'
}

const clasesTono = {
  suave: 'bg-suave text-texto',
  oscuro: 'bg-texto text-fondo',
  borde: 'border-[1.5px] border-texto bg-tarjeta text-texto',
} as const

const clasesFormato = {
  etiqueta: 'text-etiqueta-chica px-3 py-1',
  respuesta: 'text-cuerpo px-3.5 py-1.5',
} as const

// Una etiqueta es siempre un Badge con un tono (data-tono).
export function Badge({ children, tono = 'suave', formato = 'etiqueta' }: Props) {
  return (
    <span data-tono={tono} className={`inline-block rounded-full ${clasesFormato[formato]} ${clasesTono[tono]}`}>
      {children}
    </span>
  )
}
