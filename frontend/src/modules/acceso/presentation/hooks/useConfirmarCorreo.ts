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
 * Deja la barra sin lo que vaya tras «#». Con `state` nulo: así el enrutador de Next copia la dirección limpia en su
 * propio estado (con el `state` de Next lo tomaría por una llamada suya y la ignoraría). Si no se entera, al refrescar
 * la página (por ejemplo, tras una acción que escribe cookies) vuelve a escribir la dirección con el token.
 */
function quitarFragmento() {
  const { pathname, search } = window.location
  window.history.replaceState(null, '', pathname + search)
}

/** Lee el token que haya tras «#» y lo borra de la barra y del historial: no debe quedar a la vista ni guardado */
function tomarTokenDeLaDireccion(): string | undefined {
  const token = tokenDeLaDireccion(window.location.hash)
  if (window.location.hash) quitarFragmento()
  // Al cargar la página, este efecto corre antes de que Next conecte su enrutador con el historial: se vuelve a
  // quitar después, cuando ya lo está, para que Next lo sepa. Solo si no llegó otro token mientras (a ese lo atiende
  // `hashchange`)
  if (token !== undefined) {
    window.setTimeout(() => {
      const actual = tokenDeLaDireccion(window.location.hash)
      if (actual === undefined || actual === token) quitarFragmento()
    }, 0)
  }
  return token
}

/**
 * Lee el token de la dirección, lo borra de la barra y confirma el correo. Cada token se confirma una sola vez (el
 * enlace es de un solo uso), aunque en desarrollo React ejecute los efectos dos veces. Si con la página ya abierta se
 * abre otro enlace en la misma pestaña, el navegador no la recarga (solo cambia lo de tras «#»): también se atiende.
 * Si además se quedó dentro (el enlace se abrió en el navegador que lo pidió), llama a `alEntrar` y sigue en
 * «confirmando» mientras cambia la página.
 */
export function useConfirmarCorreo(alConfirmar: AccionConfirmar, alEntrar: () => void) {
  const [estado, setEstado] = useState<EstadoConfirmacion>({ tipo: 'confirmando' })
  const token = useRef<string | undefined>(undefined)
  const leido = useRef(false)
  const atendidos = useRef(new Set<string>())

  const confirmar = useCallback(
    async (valor: string) => {
      setEstado({ tipo: 'confirmando' })
      try {
        const resultado = await alConfirmar(valor)
        if (resultado.ok && resultado.dentro) return alEntrar()
        setEstado(resultado.ok ? { tipo: 'confirmado', correo: resultado.correo } : { tipo: resultado.motivo })
      } catch {
        setEstado({ tipo: 'fallo' })
      }
    },
    [alConfirmar, alEntrar],
  )

  const atender = useCallback(
    (valor: string) => {
      if (atendidos.current.has(valor)) return
      atendidos.current.add(valor)
      token.current = valor
      void confirmar(valor)
    },
    [confirmar],
  )

  useEffect(() => {
    if (!leido.current) {
      leido.current = true
      const inicial = tomarTokenDeLaDireccion()
      // Asíncrono también sin token, para que el cambio de estado no ocurra dentro del propio efecto
      void Promise.resolve().then(() => (inicial === undefined ? setEstado({ tipo: 'sinEnlace' }) : atender(inicial)))
    }
    function alCambiarLaDireccion() {
      const nuevo = tomarTokenDeLaDireccion()
      if (nuevo !== undefined) atender(nuevo)
    }
    window.addEventListener('hashchange', alCambiarLaDireccion)
    return () => window.removeEventListener('hashchange', alCambiarLaDireccion)
  }, [atender])

  function reintentar() {
    if (token.current !== undefined) void confirmar(token.current)
  }

  return { estado, reintentar }
}
