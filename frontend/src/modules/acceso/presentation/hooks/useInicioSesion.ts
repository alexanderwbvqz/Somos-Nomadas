'use client'

import { useState } from 'react'
import type { ResultadoInicioSesion } from '../../application/iniciarSesion'
import {
  hayErroresCuenta,
  validarInicioSesion,
  type DatosInicioSesion,
  type ErroresInicioSesion,
} from '../../domain/cuenta'

export type AccionIniciarSesion = (datos: DatosInicioSesion) => Promise<ResultadoInicioSesion>

/** `alEntrar` se llama una vez, cuando el correo y la contraseña valen: es quien lleva a la persona adentro */
export function useInicioSesion(alIniciar: AccionIniciarSesion, alEntrar: () => void) {
  const [datos, setDatos] = useState<DatosInicioSesion>({ correo: '', clave: '' })
  const [errores, setErrores] = useState<ErroresInicioSesion>({})
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState<'credenciales' | 'limite' | 'sinConfirmar' | 'fallo' | undefined>()
  const [enfoque, setEnfoque] = useState<{ id: string } | undefined>()

  function cambiar<K extends keyof DatosInicioSesion>(clave: K, valor: string) {
    const nuevos = { ...datos, [clave]: valor }
    setDatos(nuevos)
    if (hayErroresCuenta(errores)) {
      const actuales = validarInicioSesion(nuevos)
      setErrores(Object.fromEntries(Object.entries(actuales).filter(([campo]) => campo in errores)) as ErroresInicioSesion)
    }
  }

  function mostrarErrores(nuevos: ErroresInicioSesion) {
    const primero = nuevos.correo ? 'correo' : nuevos.clave ? 'clave' : undefined
    if (!primero) return
    setErrores(nuevos)
    setEnfoque({ id: `campo-${primero}` })
  }

  async function enviar() {
    if (enviando) return
    setAviso(undefined)
    const encontrados = validarInicioSesion(datos)
    if (hayErroresCuenta(encontrados)) return mostrarErrores(encontrados)

    setEnviando(true)
    let dentro = false
    try {
      const resultado = await alIniciar(datos)
      if (resultado.ok) {
        dentro = true
        setErrores({})
        alEntrar()
      } else if (hayErroresCuenta(resultado.errores)) mostrarErrores(resultado.errores)
      else {
        setAviso(resultado.motivo ?? 'fallo')
        if (resultado.motivo === 'credenciales') {
          // La contraseña errónea se borra y el foco vuelve a ella para escribirla de nuevo
          setDatos((actuales) => ({ ...actuales, clave: '' }))
          setEnfoque({ id: 'campo-clave' })
        }
      }
    } catch {
      setAviso('fallo')
    } finally {
      // Ya dentro, el botón sigue ocupado mientras cambia la página: no se puede enviar otra vez
      if (!dentro) setEnviando(false)
    }
  }

  return { datos, errores, enviando, aviso, enfoque, cambiar, enviar }
}
