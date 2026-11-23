'use client'

import { useState, type ReactNode } from 'react'
import { Etiqueta } from './Etiqueta'
import { MensajeError } from './MensajeError'
import { foco } from './EnlaceBoton'

type Props = {
  /** El control tiene id `campo-{clave}` */
  clave: string
  etiqueta: string
  valor: string
  alCambiar: (valor: string) => void
  /** new-password al crear una contraseña, current-password al usar la que ya se tiene */
  autoComplete: 'new-password' | 'current-password'
  textos: { mostrar: string; ocultar: string }
  error?: string
  maxLength?: number
  /** Algo que va debajo del campo, como el indicador de fortaleza; `idPie` lo enlaza con el control */
  pie?: ReactNode
  idPie?: string
}

// Campo de contraseña con un botón para verla u ocultarla.
export function CampoClave({ clave, etiqueta, valor, alCambiar, autoComplete, textos, error, maxLength, pie, idPie }: Props) {
  const [visible, setVisible] = useState(false)
  const id = `campo-${clave}`
  const descrito = [idPie, error ? `error-${clave}` : undefined].filter(Boolean).join(' ') || undefined

  return (
    <div>
      <Etiqueta htmlFor={id}>{etiqueta}</Etiqueta>
      <div className="relative">
        <input
          id={id}
          name={clave}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          maxLength={maxLength}
          value={valor}
          onChange={(evento) => alCambiar(evento.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={descrito}
          className={`w-full rounded-xl bg-tarjeta py-3 pl-4 pr-24 text-base text-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario ${
            error ? 'border-2 border-primario' : 'border-[1.5px] border-texto/45'
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((actual) => !actual)}
          className={`text-nota absolute right-3 top-1/2 -translate-y-1/2 p-1.5 underline underline-offset-4 ${foco}`}
        >
          {visible ? textos.ocultar : textos.mostrar}
        </button>
      </div>
      {error && <MensajeError id={`error-${clave}`}>{error}</MensajeError>}
      {pie}
    </div>
  )
}
