'use client'

import { useState, type DragEvent, type ReactNode } from 'react'
import { tamanoLegible } from '@/shared/lib/tamanoLegible'
import { MensajeError } from './Campos'

type Props = {
  /** El control tiene id `campo-{clave}` */
  clave: string
  titulo: string
  /** Debajo del título: qué se admite, cuánto pesa… */
  ayuda: ReactNode
  /** Lo que acepta el selector de archivos, por ejemplo "application/pdf,.pdf" */
  accept: string
  /** El archivo elegido; sin él se ve la zona para soltar uno */
  archivo?: { nombre: string; tamano: number }
  alElegir: (archivo: File) => void
  alQuitar: () => void
  textoQuitar: string
  error?: string
}

// Zona para soltar un archivo o elegirlo con el selector. Es un control de verdad (se llega con el teclado y se abre
// con Enter o espacio). Solo avisa de qué archivo se eligió: revisar si sirve es cosa de quien la usa.
export function CampoArchivo({ clave, titulo, ayuda, accept, archivo, alElegir, alQuitar, textoQuitar, error }: Props) {
  const [arrastrando, setArrastrando] = useState(false)
  const id = `campo-${clave}`

  function alSoltar(evento: DragEvent) {
    evento.preventDefault()
    setArrastrando(false)
    const soltado = evento.dataTransfer.files[0]
    if (soltado) alElegir(soltado)
  }

  return (
    <div>
      <label
        htmlFor={id}
        onDragOver={(evento) => {
          evento.preventDefault()
          setArrastrando(true)
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={alSoltar}
        className={`block cursor-pointer rounded-2xl border-2 border-dashed bg-tarjeta px-6 py-8 text-center focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-primario ${
          error ? 'border-primario' : arrastrando ? 'border-texto bg-suave' : 'border-texto/45 hover:border-texto'
        }`}
      >
        <input
          id={id}
          type="file"
          accept={accept}
          onChange={(evento) => {
            const elegido = evento.target.files?.[0]
            // Se vacía el selector para que elegir otra vez el mismo archivo también cuente
            evento.target.value = ''
            if (elegido) alElegir(elegido)
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `error-${clave}` : undefined}
          className="sr-only"
        />
        <span className="text-titulo-tarjeta block">{titulo}</span>
        <span className="text-cuerpo mt-1.5 block opacity-75">{ayuda}</span>
      </label>

      {archivo && (
        <p className="text-parrafo mt-3 flex items-center justify-between gap-4 rounded-xl bg-suave px-4 py-3">
          <span className="min-w-0 break-words">
            {archivo.nombre} <span className="opacity-65">· {tamanoLegible(archivo.tamano)}</span>
          </span>
          <button
            type="button"
            onClick={alQuitar}
            className="text-nota flex-none underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primario"
          >
            {textoQuitar}
          </button>
        </p>
      )}
      {error && <MensajeError id={`error-${clave}`}>{error}</MensajeError>}
    </div>
  )
}
