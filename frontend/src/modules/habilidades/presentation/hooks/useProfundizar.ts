'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { ErroresGuardarProfundizacion, ResultadoGuardar } from '../../application/respuestas'
import type { HabilidadId } from '../../domain/catalogo'
import { tiempoDeRespuestas, type RespuestasProfundizacion } from '../../domain/preguntas'

export type AccionGuardarProfundizacion = (entrada: {
  habilidad: HabilidadId
  respuestas: RespuestasProfundizacion
}) => Promise<ResultadoGuardar<ErroresGuardarProfundizacion>>

type Contadas = Partial<Record<HabilidadId, RespuestasProfundizacion>>

/** Lo contestado sin las respuestas vacías: un texto en blanco o una lista sin nada es como no haber contestado */
function sinVacias(respuestas: RespuestasProfundizacion): RespuestasProfundizacion {
  return Object.fromEntries(
    Object.entries(respuestas).filter(([, valor]) => (Array.isArray(valor) ? valor.length > 0 : valor.trim() !== '')),
  )
}

/** `hrefSiguiente` es adónde va la persona en cuanto se guarda todo lo que contó */
export function useProfundizar(habilidades: readonly HabilidadId[], contadasIniciales: Contadas, alGuardar: AccionGuardarProfundizacion, hrefSiguiente: string) {
  const router = useRouter()
  const [contadas, setContadas] = useState<Contadas>(contadasIniciales)
  // Un acordeón: una sección abierta a la vez; empieza la primera que falta por contar
  const [abierta, setAbierta] = useState<HabilidadId | undefined>(
    () => habilidades.find((habilidad) => tiempoDeRespuestas(contadasIniciales[habilidad] ?? {}) === undefined) ?? habilidades[0],
  )
  const [enfoque, setEnfoque] = useState<{ habilidad: HabilidadId } | undefined>()
  const [enviando, setEnviando] = useState(false)
  /** Ya se guardó y se está yendo al paso siguiente: no vuelve a enviarse */
  const [guardado, setGuardado] = useState(false)
  const [aviso, setAviso] = useState<'limite' | 'fallo' | undefined>()

  function cambiar(habilidad: HabilidadId, cambio: (actuales: RespuestasProfundizacion) => RespuestasProfundizacion) {
    setContadas((anteriores) => ({ ...anteriores, [habilidad]: cambio(anteriores[habilidad] ?? {}) }))
  }

  function elegirUna(habilidad: HabilidadId, pregunta: string, opcion: string) {
    cambiar(habilidad, (actuales) => ({ ...actuales, [pregunta]: opcion }))
  }

  function alternarVarias(habilidad: HabilidadId, pregunta: string, opcion: string) {
    cambiar(habilidad, (actuales) => {
      const elegidas = Array.isArray(actuales[pregunta]) ? [...(actuales[pregunta] as string[])] : []
      return { ...actuales, [pregunta]: elegidas.includes(opcion) ? elegidas.filter((elegida) => elegida !== opcion) : [...elegidas, opcion] }
    })
  }

  function escribir(habilidad: HabilidadId, pregunta: string, texto: string) {
    cambiar(habilidad, (actuales) => ({ ...actuales, [pregunta]: texto }))
  }

  function alternarSeccion(habilidad: HabilidadId) {
    setAbierta((actual) => (actual === habilidad ? undefined : habilidad))
  }

  /** «Listo, siguiente habilidad»: abre la siguiente y lleva el foco a su título */
  function abrirSiguiente(habilidad: HabilidadId) {
    const siguiente = habilidades[habilidades.indexOf(habilidad) + 1]
    if (!siguiente) return
    setAbierta(siguiente)
    setEnfoque({ habilidad: siguiente })
  }

  async function enviar() {
    if (enviando || guardado) return
    setAviso(undefined)
    setEnviando(true)
    try {
      // Se guarda cada habilidad con lo que quedó en pantalla (también las que no se tocaron, para que lo guardado sea lo que se ve)
      for (const habilidad of habilidades) {
        const resultado = await alGuardar({ habilidad, respuestas: sinVacias(contadas[habilidad] ?? {}) })
        if (!resultado.ok) {
          setAviso(resultado.motivo === 'limite' ? 'limite' : 'fallo')
          return
        }
      }
      setGuardado(true)
      router.push(hrefSiguiente)
    } catch {
      setAviso('fallo')
    } finally {
      setEnviando(false)
    }
  }

  return { contadas, abierta, enfoque, enviando, guardado, aviso, elegirUna, alternarVarias, escribir, alternarSeccion, abrirSiguiente, enviar }
}
