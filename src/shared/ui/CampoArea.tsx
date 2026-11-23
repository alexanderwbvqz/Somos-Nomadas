import type { ReactNode } from 'react'
import { bordeError, bordeNormal, claseControl, descripcion, type CampoBase } from './camposComunes'
import { Etiqueta } from './Etiqueta'
import { MensajeError } from './MensajeError'

type CampoAreaProps = CampoBase & {
  valor: string
  alCambiar: (valor: string) => void
  filas?: number
  maxLength?: number
  placeholder?: string
  /** Contenido a la derecha de la ayuda, como un contador de palabras */
  contador?: ReactNode
}

export function CampoArea({ clave, etiqueta, extraEtiqueta, ayuda, error, valor, alCambiar, filas = 4, maxLength, placeholder, contador }: CampoAreaProps) {
  const id = `campo-${clave}`
  return (
    <div>
      <Etiqueta htmlFor={id} extra={extraEtiqueta}>
        {etiqueta}
      </Etiqueta>
      <textarea
        id={id}
        name={clave}
        rows={filas}
        maxLength={maxLength}
        placeholder={placeholder}
        value={valor}
        onChange={(evento) => alCambiar(evento.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={descripcion(clave, ayuda, error)}
        className={`${claseControl} resize-y leading-normal ${error ? bordeError : bordeNormal}`}
      />
      <div className="mt-1.5 flex items-start justify-between gap-4">
        {ayuda ? (
          <p id={`ayuda-${clave}`} className="text-nota opacity-70">
            {ayuda}
          </p>
        ) : (
          <span />
        )}
        {contador}
      </div>
      {error && <MensajeError id={`error-${clave}`}>{error}</MensajeError>}
    </div>
  )
}
