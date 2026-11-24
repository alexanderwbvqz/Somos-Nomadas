import type { ReactNode } from 'react'
import { MensajeError } from './MensajeError'

type CasillaProps = {
  clave: string
  marcada: boolean
  alCambiar: (marcada: boolean) => void
  error?: string
  children: ReactNode
}

export function Casilla({ clave, marcada, alCambiar, error, children }: CasillaProps) {
  const id = `campo-${clave}`
  return (
    <div>
      <label htmlFor={id} className="text-parrafo flex cursor-pointer items-start gap-3">
        <input
          id={id}
          name={clave}
          type="checkbox"
          checked={marcada}
          onChange={(evento) => alCambiar(evento.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `error-${clave}` : undefined}
          className="mt-1 size-5 flex-none accent-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
        />
        <span>{children}</span>
      </label>
      {error && <MensajeError id={`error-${clave}`}>{error}</MensajeError>}
    </div>
  )
}
