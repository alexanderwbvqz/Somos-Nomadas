import type { ReactNode } from 'react'

// Una etiqueta es siempre un Badge con un tono (data-tono).
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span data-tono="suave" className="text-etiqueta-chica inline-block rounded-full bg-suave px-3 py-1 text-texto">
      {children}
    </span>
  )
}
