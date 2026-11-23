import type { ReactNode } from 'react'
import { Badge } from '@/shared/ui/Badge'

/** Una pregunta pequeña y, debajo, lo que se contestó */
export function ParRespuesta({ pregunta, children }: { pregunta: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-nota mb-1.5 opacity-65">{pregunta}</p>
      {children}
    </div>
  )
}

/** Las opciones que se eligieron, como etiquetas */
export function Respuestas({ respuestas }: { respuestas: readonly string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {respuestas.map((respuesta) => (
        <li key={respuesta}>
          <Badge formato="respuesta">{respuesta}</Badge>
        </li>
      ))}
    </ul>
  )
}
