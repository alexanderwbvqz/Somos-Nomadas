'use client'

import { useState, type KeyboardEvent, type ReactNode } from 'react'
import { Etiqueta } from './Etiqueta'
import { MensajeError } from './MensajeError'

type Opcion = { valor: string; texto: string }

type Props = {
  /** El botón tiene id `campo-{clave}` */
  clave: string
  etiqueta: ReactNode
  valor: string
  alCambiar: (valor: string) => void
  opciones: Opcion[]
  /** Lo que se ve mientras no se haya elegido nada */
  placeholder: string
  error?: string
}

// Lista desplegable con el aspecto del sitio (la nativa no se puede estilizar). Sigue el patrón ARIA de combobox
// de solo selección: el foco se queda en el botón y la opción activa se anuncia con aria-activedescendant.
export function CampoLista({ clave, etiqueta, valor, alCambiar, opciones, placeholder, error }: Props) {
  const [abierta, setAbierta] = useState(false)
  const [activa, setActiva] = useState(0)
  const id = `campo-${clave}`
  const idLista = `lista-${clave}`
  const idOpcion = (indice: number) => `opcion-${clave}-${indice}`
  const elegida = opciones.find((opcion) => opcion.valor === valor)

  function abrir() {
    setActiva(Math.max(0, opciones.findIndex((opcion) => opcion.valor === valor)))
    setAbierta(true)
  }

  function elegir(indice: number) {
    const opcion = opciones[indice]
    if (opcion) alCambiar(opcion.valor)
    setAbierta(false)
  }

  function mover(indice: number) {
    const dentro = Math.min(opciones.length - 1, Math.max(0, indice))
    setActiva(dentro)
    document.getElementById(idOpcion(dentro))?.scrollIntoView?.({ block: 'nearest' })
  }

  function alPulsarTecla(evento: KeyboardEvent<HTMLButtonElement>) {
    const tecla = evento.key
    if (!abierta) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(tecla)) {
        evento.preventDefault()
        abrir()
      }
      return
    }
    if (tecla === 'ArrowDown') mover(activa + 1)
    else if (tecla === 'ArrowUp') mover(activa - 1)
    else if (tecla === 'Home') mover(0)
    else if (tecla === 'End') mover(opciones.length - 1)
    else if (tecla === 'Enter' || tecla === ' ') elegir(activa)
    else if (tecla === 'Escape') setAbierta(false)
    else if (tecla.length === 1) {
      // Escribir una letra salta a la siguiente opción que empiece por ella
      const letra = tecla.toLocaleLowerCase()
      const siguientes = [...opciones.keys()].slice(activa + 1).concat([...opciones.keys()].slice(0, activa + 1))
      const encontrada = siguientes.find((indice) => opciones[indice]?.texto.toLocaleLowerCase().startsWith(letra))
      if (encontrada !== undefined) mover(encontrada)
      return
    } else return
    evento.preventDefault()
  }

  return (
    <div>
      <Etiqueta htmlFor={id}>{etiqueta}</Etiqueta>
      <div className="relative">
        <button
          id={id}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={abierta}
          aria-controls={abierta ? idLista : undefined}
          aria-activedescendant={abierta ? idOpcion(activa) : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `error-${clave}` : undefined}
          onClick={() => (abierta ? setAbierta(false) : abrir())}
          onBlur={() => setAbierta(false)}
          onKeyDown={alPulsarTecla}
          className={`flex w-full items-center justify-between gap-3 rounded-xl bg-tarjeta px-4 py-3 text-left text-base text-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario ${
            error ? 'border-2 border-primario' : 'border-[1.5px] border-borde-campo'
          }`}
        >
          <span className={elegida ? '' : 'opacity-60'}>{elegida ? elegida.texto : placeholder}</span>
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={`size-4 flex-none ${abierta ? 'rotate-180' : ''}`}>
            <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {abierta && (
          <ul
            id={idLista}
            role="listbox"
            aria-labelledby={id}
            className="absolute inset-x-0 top-full z-10 mt-1.5 max-h-96 overflow-y-auto rounded-2xl border-[1.5px] border-texto bg-tarjeta p-1.5"
          >
            {opciones.map((opcion, indice) => (
              <li
                key={opcion.valor}
                id={idOpcion(indice)}
                role="option"
                aria-selected={opcion.valor === valor}
                // mousedown y no click: así el botón no pierde el foco (y no se cierra la lista) antes de elegir
                onMouseDown={(evento) => {
                  evento.preventDefault()
                  elegir(indice)
                }}
                onMouseEnter={() => setActiva(indice)}
                className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-base ${
                  indice === activa ? 'bg-suave' : ''
                } ${opcion.valor === valor ? 'font-medium' : ''}`}
              >
                {opcion.texto}
                {opcion.valor === valor && <span aria-hidden="true">✓</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <MensajeError id={`error-${clave}`}>{error}</MensajeError>}
    </div>
  )
}
