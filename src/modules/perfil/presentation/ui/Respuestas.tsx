import { Badge } from '@/shared/ui/Badge'

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
