import type { ReactNode } from 'react'

type EtiquetaProps = {
  htmlFor: string
  children: ReactNode
  /** Algo que va junto a la etiqueta, como una insignia "Privado" */
  extra?: ReactNode
}

export function Etiqueta({ htmlFor, children, extra }: EtiquetaProps) {
  return (
    <label htmlFor={htmlFor} className="text-parrafo mb-2 block font-medium">
      {children}
      {extra}
    </label>
  )
}
