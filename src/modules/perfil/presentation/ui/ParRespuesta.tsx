import type { ReactNode } from 'react'

/** Una pregunta pequeña y, debajo, lo que se contestó */
export function ParRespuesta({ pregunta, children }: { pregunta: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-nota mb-1.5 text-texto-tenue">{pregunta}</p>
      {children}
    </div>
  )
}
