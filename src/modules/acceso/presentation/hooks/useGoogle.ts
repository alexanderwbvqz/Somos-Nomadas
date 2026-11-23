'use client'

import { useState } from 'react'
import type { ResultadoGoogle } from '../../application/continuarConGoogle'

export type AccionGoogle = (credencial: string) => Promise<ResultadoGoogle>

// simulado: con Google de verdad, aquí llegaría la credencial (el token) que Google entrega al navegador tras
// elegir la cuenta. Mientras no exista esa conexión se manda una credencial de ejemplo.
export const CREDENCIAL_SIMULADA = 'credencial-simulada'

/** Estado del flujo "Continuar con Google": lo comparten crear cuenta e iniciar sesión */
export function useGoogle(alContinuar: AccionGoogle) {
  const [cargando, setCargando] = useState(false)
  const [aviso, setAviso] = useState<'limite' | 'fallo' | 'rechazada' | undefined>()
  /** El correo de la cuenta de Google con la que se entró */
  const [correo, setCorreo] = useState<string | undefined>()

  async function continuar() {
    if (cargando) return
    setCargando(true)
    setAviso(undefined)
    try {
      const resultado = await alContinuar(CREDENCIAL_SIMULADA)
      if (resultado.ok) setCorreo(resultado.correo)
      else setAviso(resultado.motivo)
    } catch {
      setAviso('fallo')
    } finally {
      setCargando(false)
    }
  }

  return { cargando, aviso, correo, continuar }
}
