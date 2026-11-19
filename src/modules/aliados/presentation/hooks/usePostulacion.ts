'use client'

import { useState } from 'react'
import type { ResultadoPostulacion } from '../../application/enviarPostulacion'
import {
  datosPostulacionVacios,
  hayErrores,
  validarPaso,
  validarPostulacion,
  type DatosPostulacion,
  type ErroresPostulacion,
  type PasoPostulacion,
} from '../../domain/postulacion'

export type AccionEnviarPostulacion = (datos: DatosPostulacion) => Promise<ResultadoPostulacion>

/** Dónde está la persona: en uno de los cuatro pasos o ya con la postulación enviada */
export type VistaPostulacion = PasoPostulacion | 'listo'

type ClaveError = keyof DatosPostulacion | 'contacto'

// Orden de los campos de cada paso, para llevar el foco al primero que tenga un error
const ordenCampos: Record<PasoPostulacion, ClaveError[]> = {
  1: ['tipo', 'nombre', 'personaContacto', 'correo'],
  2: ['descripcionCorta', 'descripcionLarga', 'apoyos', 'areas', 'paraQuien', 'datosClave'],
  3: ['ciudad', 'sitioWeb', 'linkedin', 'instagram', 'whatsapp', 'enlaceAgenda', 'contacto', 'consentimientoWhatsapp'],
  4: ['aceptaPolitica'],
}

const pasos: PasoPostulacion[] = [1, 2, 3, 4]

/** Id del control de un campo; el aviso de "falta un contacto" apunta al primer campo de contacto */
export function idDelCampo(clave: ClaveError): string {
  return clave === 'contacto' ? 'campo-whatsapp' : `campo-${clave}`
}

/** El primer paso, en orden, que tiene algún error, y su primer campo con error */
export function primerError(errores: ErroresPostulacion): { paso: PasoPostulacion; clave: ClaveError } | undefined {
  for (const paso of pasos) {
    const clave = ordenCampos[paso].find((campo) => errores[campo])
    if (clave) return { paso, clave }
  }
  return undefined
}

export function usePostulacion(alEnviar: AccionEnviarPostulacion) {
  const [datos, setDatos] = useState<DatosPostulacion>(datosPostulacionVacios)
  const [vista, setVista] = useState<VistaPostulacion>(1)
  const [errores, setErrores] = useState<ErroresPostulacion>({})
  const [enviando, setEnviando] = useState(false)
  const [avisoEnvio, setAvisoEnvio] = useState<'limite' | 'fallo' | undefined>()
  // Cada objeto nuevo pide llevar el foco a ese control
  const [enfoque, setEnfoque] = useState<{ id: string } | undefined>()

  function cambiar<K extends keyof DatosPostulacion>(clave: K, valor: DatosPostulacion[K]) {
    const nuevos = { ...datos, [clave]: valor }
    setDatos(nuevos)
    // Con errores a la vista, los que ya se han corregido desaparecen al escribir; no aparecen errores nuevos hasta pulsar de nuevo
    if (vista !== 'listo' && hayErrores(errores)) {
      const actuales = validarPaso(nuevos, vista)
      setErrores(Object.fromEntries(Object.entries(actuales).filter(([campo]) => campo in errores)) as ErroresPostulacion)
    }
  }

  function mostrarErrores(nuevos: ErroresPostulacion) {
    const primero = primerError(nuevos)
    if (!primero) return
    setErrores(nuevos)
    setVista(primero.paso)
    setEnfoque({ id: idDelCampo(primero.clave) })
  }

  function siguiente() {
    if (vista === 'listo' || vista === 4) return
    const encontrados = validarPaso(datos, vista)
    if (hayErrores(encontrados)) return mostrarErrores(encontrados)
    setErrores({})
    setAvisoEnvio(undefined)
    setVista((vista + 1) as PasoPostulacion)
  }

  function anterior() {
    if (vista === 'listo' || vista === 1) return
    setErrores({})
    setAvisoEnvio(undefined)
    setVista((vista - 1) as PasoPostulacion)
  }

  function irA(paso: PasoPostulacion) {
    setErrores({})
    setAvisoEnvio(undefined)
    setVista(paso)
  }

  async function enviar() {
    if (vista !== 4 || enviando) return
    const encontrados = validarPostulacion(datos)
    if (hayErrores(encontrados)) return mostrarErrores(encontrados)

    setEnviando(true)
    setAvisoEnvio(undefined)
    try {
      const resultado = await alEnviar(datos)
      if (resultado.ok) setVista('listo')
      else if (hayErrores(resultado.errores)) mostrarErrores(resultado.errores)
      else setAvisoEnvio(resultado.motivo ?? 'fallo')
    } catch {
      setAvisoEnvio('fallo')
    } finally {
      setEnviando(false)
    }
  }

  return { datos, vista, errores, enviando, avisoEnvio, enfoque, cambiar, siguiente, anterior, irA, enviar }
}
