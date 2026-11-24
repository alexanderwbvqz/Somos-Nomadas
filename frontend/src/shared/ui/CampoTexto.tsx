import type { HTMLInputTypeAttribute } from 'react'
import { bordeError, bordeNormal, claseControl, descripcion, type CampoBase } from './camposComunes'
import { Etiqueta } from './Etiqueta'
import { MensajeError } from './MensajeError'

type CampoTextoProps = CampoBase & {
  valor: string
  alCambiar: (valor: string) => void
  tipo?: HTMLInputTypeAttribute
  inputMode?: 'text' | 'email' | 'tel' | 'url'
  autoComplete?: string
  placeholder?: string
  maxLength?: number
}

export function CampoTexto({ clave, etiqueta, extraEtiqueta, ayuda, error, valor, alCambiar, tipo = 'text', inputMode, autoComplete, placeholder, maxLength }: CampoTextoProps) {
  const id = `campo-${clave}`
  return (
    <div>
      <Etiqueta htmlFor={id} extra={extraEtiqueta}>
        {etiqueta}
      </Etiqueta>
      <input
        id={id}
        name={clave}
        type={tipo}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        maxLength={maxLength}
        value={valor}
        onChange={(evento) => alCambiar(evento.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={descripcion(clave, ayuda, error)}
        className={`${claseControl} ${error ? bordeError : bordeNormal}`}
      />
      {ayuda && (
        <p id={`ayuda-${clave}`} className="text-nota mt-1.5 text-texto-tenue">
          {ayuda}
        </p>
      )}
      {error && <MensajeError id={`error-${clave}`}>{error}</MensajeError>}
    </div>
  )
}
