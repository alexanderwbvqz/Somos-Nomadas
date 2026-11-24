'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { ResultadoGuardar } from '../../application/respuestas'
import type { GrupoId, HabilidadId } from '../../domain/catalogo'
import type { Marcas } from '../../domain/perfilArea'
import type { Frecuencia } from '../../domain/puntos'
import { gruposAbiertosAlEmpezar } from '../mappers/vistaTareas'

export type AccionGuardarTareas = (entrada: { marcas: Marcas }) => Promise<ResultadoGuardar>

/** Al marcar una tarea empieza en lo mínimo: es la persona quien sube cuántas veces la hizo, no al revés */
const FRECUENCIA_AL_MARCAR: Frecuencia = 'unaVez'

/** `hrefSiguiente` es adónde va la persona en cuanto se guardan las tareas */
export function useTareas(marcasIniciales: Marcas, alGuardar: AccionGuardarTareas, hrefSiguiente: string) {
  const router = useRouter()
  const [marcas, setMarcas] = useState<Marcas>(marcasIniciales)
  const [abiertos, setAbiertos] = useState<GrupoId[]>(() => gruposAbiertosAlEmpezar(marcasIniciales))
  const [enviando, setEnviando] = useState(false)
  /** Ya se guardó y se está yendo al paso siguiente: no vuelve a enviarse */
  const [guardado, setGuardado] = useState(false)
  const [aviso, setAviso] = useState<'limite' | 'fallo' | undefined>()

  const cantidad = Object.keys(marcas).length
  /** Hace falta al menos una tarea: sin ellas no hay de qué hablar en el paso siguiente */
  const completo = cantidad > 0

  function alternarTarea(habilidad: HabilidadId) {
    setMarcas((actuales) =>
      habilidad in actuales
        ? (Object.fromEntries(Object.entries(actuales).filter(([clave]) => clave !== habilidad)) as Marcas)
        : { ...actuales, [habilidad]: FRECUENCIA_AL_MARCAR },
    )
  }

  function cambiarFrecuencia(habilidad: HabilidadId, frecuencia: Frecuencia) {
    setMarcas((actuales) => ({ ...actuales, [habilidad]: frecuencia }))
  }

  function alternarGrupo(grupo: GrupoId) {
    setAbiertos((actuales) => (actuales.includes(grupo) ? actuales.filter((abierto) => abierto !== grupo) : [...actuales, grupo]))
  }

  async function enviar() {
    if (enviando || guardado || !completo) return
    setAviso(undefined)
    setEnviando(true)
    try {
      const resultado = await alGuardar({ marcas })
      if (resultado.ok) {
        setGuardado(true)
        router.push(hrefSiguiente)
      } else setAviso(resultado.motivo ?? 'fallo')
    } catch {
      setAviso('fallo')
    } finally {
      setEnviando(false)
    }
  }

  return { marcas, abiertos, cantidad, completo, enviando, guardado, aviso, alternarTarea, cambiarFrecuencia, alternarGrupo, enviar }
}
