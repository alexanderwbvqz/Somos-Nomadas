'use client'

import { useState } from 'react'
import type { ResultadoGuardar } from '../../application/resultado'
import {
  hayErroresEvidencia,
  LIMITES_EVIDENCIA,
  limpiarEvidencia,
  validarEvidencia,
  type CodigoErrorEvidencia,
  type ErroresEvidencia,
} from '../../domain/evidencia'

export type AccionGuardarEvidencia = (entrada: { enlaces: string[] }) => Promise<ResultadoGuardar<ErroresEvidencia>>

/** «Evidencia»: cada vez que se suma o se quita un enlace se guarda la lista entera. */
export function useEvidencia(inicial: string[], alGuardar: AccionGuardarEvidencia) {
  const [enlaces, setEnlaces] = useState(inicial)
  const [editando, setEditando] = useState(false)
  const [nuevo, setNuevo] = useState('')
  const [error, setError] = useState<CodigoErrorEvidencia | 'demasiados' | undefined>()
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState<'limite' | 'fallo' | undefined>()

  function abrir() {
    setError(undefined)
    setAviso(undefined)
    setEditando(true)
  }

  function cerrar() {
    setEditando(false)
    setNuevo('')
    setError(undefined)
    setAviso(undefined)
  }

  function cambiar(texto: string) {
    setNuevo(texto)
    if (error) setError(undefined)
  }

  /** Guarda la lista entera; devuelve el resultado, o undefined si no se pudo ni intentar */
  async function guardarLista(lista: string[]): Promise<ResultadoGuardar<ErroresEvidencia> | undefined> {
    setGuardando(true)
    setAviso(undefined)
    try {
      const resultado = await alGuardar({ enlaces: lista })
      if (resultado.ok) setEnlaces(limpiarEvidencia(lista))
      else if (!hayErroresEvidencia(resultado.errores)) setAviso(resultado.motivo ?? 'fallo')
      return resultado
    } catch {
      setAviso('fallo')
      return undefined
    } finally {
      setGuardando(false)
    }
  }

  async function agregar() {
    if (guardando) return
    if (enlaces.length >= LIMITES_EVIDENCIA.enlaces) {
      setError('demasiados')
      return
    }
    const lista = [...enlaces, nuevo]
    const encontrados = validarEvidencia(lista)
    const delNuevo = encontrados.enlaces[lista.length - 1]
    if (delNuevo) {
      setError(delNuevo)
      return
    }

    const resultado = await guardarLista(lista)
    if (resultado?.ok) {
      setNuevo('')
      setError(undefined)
    } else if (resultado && hayErroresEvidencia(resultado.errores)) {
      setError(resultado.errores.enlaces[lista.length - 1] ?? 'enlaceInvalido')
    }
  }

  async function quitar(lugar: number) {
    if (guardando) return
    await guardarLista(enlaces.filter((_, i) => i !== lugar))
  }

  return { enlaces, editando, nuevo, error, guardando, aviso, abrir, cerrar, cambiar, agregar, quitar }
}
