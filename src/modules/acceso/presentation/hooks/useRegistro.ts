'use client'

import { useState } from 'react'
import type { ResultadoRegistro } from '../../application/registrarCuenta'
import {
  datosRegistroVacios,
  hayErroresCuenta,
  validarRegistro,
  type DatosRegistro,
  type ErroresRegistro,
} from '../../domain/cuenta'

export type AccionRegistrar = (datos: DatosRegistro) => Promise<ResultadoRegistro>

// Orden de los campos tal como se ven (la casilla va arriba, antes de Google), para llevar el foco al primero con error
const ordenCampos: (keyof DatosRegistro)[] = ['aceptaPolitica', 'correo', 'clave']

export function idDelCampoRegistro(clave: keyof DatosRegistro): string {
  return `campo-${clave}`
}

export function useRegistro(alRegistrar: AccionRegistrar) {
  const [datos, setDatos] = useState<DatosRegistro>(datosRegistroVacios)
  const [errores, setErrores] = useState<ErroresRegistro>({})
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState<'limite' | 'fallo' | undefined>()
  /** El correo al que se mandó el enlace, una vez creada la cuenta */
  const [correoEnviado, setCorreoEnviado] = useState<string | undefined>()
  // Cada objeto nuevo pide llevar el foco a ese control
  const [enfoque, setEnfoque] = useState<{ id: string } | undefined>()

  function cambiar<K extends keyof DatosRegistro>(clave: K, valor: DatosRegistro[K]) {
    const nuevos = { ...datos, [clave]: valor }
    setDatos(nuevos)
    // Con errores a la vista, los ya corregidos desaparecen al escribir; no aparecen errores nuevos hasta volver a enviar
    if (hayErroresCuenta(errores)) {
      const actuales = validarRegistro(nuevos)
      setErrores(Object.fromEntries(Object.entries(actuales).filter(([campo]) => campo in errores)) as ErroresRegistro)
    }
  }

  function mostrarErrores(nuevos: ErroresRegistro) {
    const primero = ordenCampos.find((campo) => nuevos[campo])
    if (!primero) return
    setErrores(nuevos)
    setEnfoque({ id: idDelCampoRegistro(primero) })
  }

  async function enviar() {
    if (enviando) return
    setAviso(undefined)
    const encontrados = validarRegistro(datos)
    if (hayErroresCuenta(encontrados)) return mostrarErrores(encontrados)

    setEnviando(true)
    try {
      const resultado = await alRegistrar(datos)
      if (resultado.ok) {
        setErrores({})
        setCorreoEnviado(resultado.correo)
      } else if (hayErroresCuenta(resultado.errores)) mostrarErrores(resultado.errores)
      else setAviso(resultado.motivo ?? 'fallo')
    } catch {
      setAviso('fallo')
    } finally {
      setEnviando(false)
    }
  }

  /**
   * La política de datos hay que aceptarla también para entrar con Google. Si no está marcada, avisa en la casilla,
   * lleva el foco a ella y devuelve false; así quien llama no sigue adelante.
   */
  function exigirPolitica(): boolean {
    if (datos.aceptaPolitica) return true
    setErrores((actuales) => ({ ...actuales, aceptaPolitica: 'politicaRequerida' }))
    setEnfoque({ id: idDelCampoRegistro('aceptaPolitica') })
    return false
  }

  /** Vuelve al formulario con lo que ya había escrito, para corregir el correo */
  function volverAlFormulario() {
    setCorreoEnviado(undefined)
    setEnfoque({ id: idDelCampoRegistro('correo') })
  }

  return { datos, errores, enviando, aviso, correoEnviado, enfoque, cambiar, enviar, exigirPolitica, volverAlFormulario }
}
