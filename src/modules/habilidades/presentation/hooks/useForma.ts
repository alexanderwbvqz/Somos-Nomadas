'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { ResultadoGuardar } from '../../application/respuestas'
import { areas, type AreaId } from '../../domain/catalogo'
import { hayErroresForma, preguntasForma, validarForma, type DatosForma, type EntradaForma, type ErroresForma, type PreguntaFormaId } from '../../domain/forma'
import { indiceInicial } from '../mappers/vistaForma'

export type AccionGuardarForma = (entrada: EntradaForma) => Promise<ResultadoGuardar<ErroresForma>>

/** Lo que se ve de la tarjeta elegida antes de pasar a la pregunta siguiente */
const PAUSA_AL_ELEGIR_MS = 220

/** Lo contestado, sin las preguntas que no tienen respuesta, tal como se manda al servidor */
function aEntrada(datos: DatosForma): EntradaForma {
  const respuestas = Object.fromEntries(Object.entries(datos.respuestas).filter((par): par is [string, string] => par[1] !== undefined))
  return { respuestas, busca: datos.busca, socioIdeal: datos.socioIdeal }
}

/** `hrefSiguiente` es adónde va la persona en cuanto se guarda lo que contestó */
export function useForma(inicial: DatosForma, alGuardar: AccionGuardarForma, hrefSiguiente: string) {
  const router = useRouter()
  const [datos, setDatos] = useState<DatosForma>(inicial)
  /** La pregunta en la que está; con el número de preguntas, el final (perfil que busca y socio ideal) */
  const [indice, setIndice] = useState(() => indiceInicial(inicial.respuestas))
  const [errores, setErrores] = useState<ErroresForma>({})
  const [enviando, setEnviando] = useState(false)
  /** Ya se guardó y se está yendo al paso siguiente: no vuelve a enviarse */
  const [guardado, setGuardado] = useState(false)
  const [aviso, setAviso] = useState<'limite' | 'fallo' | undefined>()
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Si se sale de la pantalla antes de pasar a la pregunta siguiente, ese paso pendiente se cancela
  useEffect(() => () => clearTimeout(temporizador.current), [])

  const total = preguntasForma.length
  const respondidas = preguntasForma.filter((pregunta) => datos.respuestas[pregunta.id] !== undefined).length

  function elegir(pregunta: PreguntaFormaId, opcion: string) {
    setDatos((actuales) => ({ ...actuales, respuestas: { ...actuales.respuestas, [pregunta]: opcion } }))
  }

  /** Con el ratón, tras elegir se pasa solo a la pregunta siguiente. Con el teclado no: las flechas solo recorren las opciones. */
  function avanzarTrasElegir(conRaton: boolean) {
    if (!conRaton) return
    const desde = indice
    clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => setIndice((actual) => (actual === desde ? actual + 1 : actual)), PAUSA_AL_ELEGIR_MS)
  }

  function ir(destino: number) {
    clearTimeout(temporizador.current)
    setIndice(Math.min(total, Math.max(0, destino)))
  }

  function alternarArea(area: AreaId) {
    setDatos((actuales) => {
      const elegidas = actuales.busca.includes(area) ? actuales.busca.filter((actual) => actual !== area) : [...actuales.busca, area]
      return { ...actuales, busca: areas.filter((candidata) => elegidas.includes(candidata)) }
    })
  }

  function escribirSocio(texto: string) {
    setDatos((actuales) => ({ ...actuales, socioIdeal: texto }))
    if (errores.socioIdeal) setErrores({})
  }

  async function enviar() {
    if (enviando || guardado) return
    setAviso(undefined)
    const entrada = aEntrada(datos)
    const encontrados = validarForma(entrada)
    if (hayErroresForma(encontrados)) {
      setErrores(encontrados)
      // Solo el texto del socio ideal puede venir mal desde la pantalla: está en el final, así que se va allí
      setIndice(total)
      return
    }

    setEnviando(true)
    try {
      const resultado = await alGuardar(entrada)
      if (resultado.ok) {
        setGuardado(true)
        router.push(hrefSiguiente)
      } else if (hayErroresForma(resultado.errores)) {
        setErrores(resultado.errores)
        setIndice(total)
      } else setAviso(resultado.motivo ?? 'fallo')
    } catch {
      setAviso('fallo')
    } finally {
      setEnviando(false)
    }
  }

  return { datos, indice, total, respondidas, errores, enviando, guardado, aviso, elegir, avanzarTrasElegir, ir, alternarArea, escribirSocio, enviar }
}
