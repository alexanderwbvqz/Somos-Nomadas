'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ResultadoConfirmacion } from '../../application/confirmarCorreo'

export type AccionConfirmar = (token: string) => Promise<ResultadoConfirmacion>

export type EstadoConfirmacion =
  | { tipo: 'confirmando' }
  | { tipo: 'confirmado'; correo: string }
  | { tipo: 'invalido' | 'sinEnlace' | 'limite' | 'fallo' }

/** El token del enlace: va tras «#token=» para que el navegador no lo mande a ningún servidor al pedir la página */
export function tokenDeLaDireccion(fragmento: string): string | undefined {
  const token = new URLSearchParams(fragmento.replace(/^#/, '')).get('token')
  return token ? token : undefined
}

/**
 * Lee el token de la dirección una sola vez, lo borra de la barra (y del historial) y confirma el correo. En
 * desarrollo React ejecuta los efectos dos veces: la confirmación se pide una sola, porque el enlace es de un solo uso.
 */
export function useConfirmarCorreo(alConfirmar: AccionConfirmar) {
  const [estado, setEstado] = useState<EstadoConfirmacion>({ tipo: 'confirmando' })
  const token = useRef<string | undefined>(undefined)
  const leido = useRef(false)

  const confirmar = useCallback(
    async (valor: string) => {
      setEstado({ tipo: 'confirmando' })
      try {
        const resultado = await alConfirmar(valor)
        setEstado(resultado.ok ? { tipo: 'confirmado', correo: resultado.correo } : { tipo: resultado.motivo })
      } catch {
        setEstado({ tipo: 'fallo' })
      }
    },
    [alConfirmar],
  )

  useEffect(() => {
    if (leido.current) return
    leido.current = true
    const { hash, pathname, search } = window.location
    token.current = tokenDeLaDireccion(hash)
    if (hash) window.history.replaceState(window.history.state, '', pathname + search)
    const valor = token.current
    // Asíncrono también sin token, para que el cambio de estado no ocurra dentro del propio efecto
    void Promise.resolve().then(() => (valor === undefined ? setEstado({ tipo: 'sinEnlace' }) : confirmar(valor)))
  }, [confirmar])

  function reintentar() {
    if (token.current !== undefined) void confirmar(token.current)
  }

  return { estado, reintentar }
}
