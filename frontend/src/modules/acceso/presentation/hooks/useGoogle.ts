'use client'

import { useState } from 'react'
import type { ResultadoGoogle } from '../../application/continuarConGoogle'

export type AccionGoogle = (credencial: string) => Promise<ResultadoGoogle>

// simulado: con Google de verdad, aquí llegaría la credencial (el token) que Google entrega al navegador tras
// elegir la cuenta. Mientras no exista esa conexión se manda una credencial de ejemplo.
export const CREDENCIAL_SIMULADA = 'credencial-simulada'

/** Estado del flujo "Continuar con Google": lo comparten crear cuenta e iniciar sesión */
/** Sin acción (todavía no hay Google detrás), `continuar` no hace nada: la pantalla ni siquiera muestra el botón */
export function useGoogle(alContinuar: AccionGoogle | undefined) {
  const [cargando, setCargando] = useState(false)
  const [aviso, setAviso] = useState<'limite' | 'fallo' | 'rechazada' | undefined>()
  /** El correo de la cuenta de Google con la que se entró */
  const [correo, setCorreo] = useState<string | undefined>()

  async function continuar() {
    if (cargando || alContinuar === undefined) return
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
