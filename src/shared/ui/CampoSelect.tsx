import { bordeError, bordeNormal, claseControl, descripcion, type CampoBase } from './camposComunes'
import { Etiqueta } from './Etiqueta'
import { MensajeError } from './MensajeError'

type CampoSelectProps = CampoBase & {
  valor: string
  alCambiar: (valor: string) => void
  opciones: { valor: string; texto: string }[]
  /** Texto de la opción vacía con la que empieza */
  placeholder: string
  autoComplete?: string
}

export function CampoSelect({ clave, etiqueta, extraEtiqueta, ayuda, error, valor, alCambiar, opciones, placeholder, autoComplete }: CampoSelectProps) {
  const id = `campo-${clave}`
  return (
    <div>
      <Etiqueta htmlFor={id} extra={extraEtiqueta}>
        {etiqueta}
      </Etiqueta>
      <select
        id={id}
        name={clave}
        autoComplete={autoComplete}
        value={valor}
        onChange={(evento) => alCambiar(evento.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={descripcion(clave, ayuda, error)}
        className={`${claseControl} ${error ? bordeError : bordeNormal}`}
      >
        <option value="">{placeholder}</option>
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.texto}
          </option>
        ))}
      </select>
      {ayuda && (
        <p id={`ayuda-${clave}`} className="text-nota mt-1.5 opacity-70">
          {ayuda}
        </p>
      )}
      {error && <MensajeError id={`error-${clave}`}>{error}</MensajeError>}
    </div>
  )
}
