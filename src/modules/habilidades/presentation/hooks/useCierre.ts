'use client'

import { useCallback, useEffect, useState } from 'react'

export type AccionPrepararCierre = () => Promise<{ ok: true } | { ok: false }>

export type EstadoCierre = 'esperando' | 'listo' | 'fallo'

/** Cuánto se queda como mínimo en la pantalla de espera: que no parpadee si el cálculo es instantáneo */
export const ESPERA_MINIMA_MS = 2500

/** Prepara el cierre y espera al menos `esperaMinima` antes de mostrar el resultado */
export function useCierre(alPreparar: AccionPrepararCierre, esperaMinima: number = ESPERA_MINIMA_MS) {
  const [estado, setEstado] = useState<EstadoCierre>('esperando')
  /** Cada intento tiene su número, para que un intento viejo no pise a uno nuevo */
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let vigente = true
    const pausa = new Promise<void>((resolver) => setTimeout(resolver, esperaMinima))
    Promise.all([alPreparar().catch(() => ({ ok: false as const })), pausa]).then(([resultado]) => {
      if (vigente) setEstado(resultado.ok ? 'listo' : 'fallo')
    })
    return () => {
      vigente = false
    }
  }, [alPreparar, intento, esperaMinima])

  const reintentar = useCallback(() => {
    setEstado('esperando')
    setIntento((actual) => actual + 1)
  }, [])

  return { estado, reintentar }
}
