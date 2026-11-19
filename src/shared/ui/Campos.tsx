import type { HTMLInputTypeAttribute, ReactNode } from 'react'

// Campos de formulario genéricos: etiqueta, ayuda y error ya conectados con el control para lectores de pantalla.

const claseControl =
  'w-full rounded-xl bg-tarjeta px-4 py-3 text-base text-texto placeholder:text-texto/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario'
const bordeNormal = 'border-[1.5px] border-texto/45'
const bordeError = 'border-2 border-primario'

/** Mensaje de error de un campo; el icono y el texto en negrita lo distinguen sin depender solo del color */
export function MensajeError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="text-cuerpo mt-2 flex items-start gap-2 font-medium">
      <span aria-hidden="true" className="mt-0.5 inline-flex size-4 flex-none items-center justify-center rounded-full bg-primario text-etiqueta-chica leading-none text-tarjeta">
        !
      </span>
      <span>{children}</span>
    </p>
  )
}

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

type CampoBase = {
  /** El control tiene id `campo-{clave}` */
  clave: string
  etiqueta: ReactNode
  extraEtiqueta?: ReactNode
  ayuda?: ReactNode
  error?: string
}

function descripcion(clave: string, ayuda: unknown, error: unknown): string | undefined {
  const ids = [ayuda ? `ayuda-${clave}` : undefined, error ? `error-${clave}` : undefined].filter(Boolean)
  return ids.length > 0 ? ids.join(' ') : undefined
}

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
        <p id={`ayuda-${clave}`} className="text-nota mt-1.5 opacity-70">
          {ayuda}
        </p>
      )}
      {error && <MensajeError id={`error-${clave}`}>{error}</MensajeError>}
    </div>
  )
}

type CampoAreaProps = CampoBase & {
  valor: string
  alCambiar: (valor: string) => void
  filas?: number
  maxLength?: number
  /** Contenido a la derecha de la ayuda, como un contador de palabras */
  contador?: ReactNode
}

export function CampoArea({ clave, etiqueta, extraEtiqueta, ayuda, error, valor, alCambiar, filas = 4, maxLength, contador }: CampoAreaProps) {
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
