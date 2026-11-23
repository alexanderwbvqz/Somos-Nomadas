'use client'

import { useState } from 'react'
import type { ResultadoGuardar } from '../../application/resultado'
import { hayErroresSobreMi, limpiarSobreMi, validarSobreMi, type ErroresSobreMi } from '../../domain/sobreMi'

export type AccionGuardarSobreMi = (entrada: { texto: string }) => Promise<ResultadoGuardar<ErroresSobreMi>>

/** «Sobre mí»: lo guardado, y el borrador mientras se edita. Un texto vacío borra lo que había. */
export function useSobreMi(inicial: string, alGuardar: AccionGuardarSobreMi) {
  const [guardado, setGuardado] = useState(inicial)
  const [editando, setEditando] = useState(false)
  const [borrador, setBorrador] = useState(inicial)
  const [errores, setErrores] = useState<ErroresSobreMi>({})
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState<'limite' | 'fallo' | undefined>()

  function abrir() {
    setBorrador(guardado)
    setErrores({})
    setAviso(undefined)
    setEditando(true)
  }

  function cancelar() {
    setEditando(false)
    setErrores({})
    setAviso(undefined)
  }

  function cambiar(texto: string) {
    setBorrador(texto)
    if (errores.texto) setErrores({})
  }

  async function guardar() {
    if (guardando) return
    setAviso(undefined)
    const encontrados = validarSobreMi(borrador)
    if (hayErroresSobreMi(encontrados)) {
      setErrores(encontrados)
      return
    }

    setGuardando(true)
    try {
      const resultado = await alGuardar({ texto: borrador })
      if (resultado.ok) {
        setGuardado(limpiarSobreMi(borrador))
        setEditando(false)
      } else if (hayErroresSobreMi(resultado.errores)) setErrores(resultado.errores)
      else setAviso(resultado.motivo ?? 'fallo')
    } catch {
      setAviso('fallo')
    } finally {
      setGuardando(false)
    }
  }

  return { guardado, editando, borrador, errores, guardando, aviso, abrir, cancelar, cambiar, guardar }
}
