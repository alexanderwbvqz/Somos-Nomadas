'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { ResultadoGuardar } from '../../application/respuestas'
import {
  alternarSector,
  hayErroresHistorias,
  hayTexto,
  validarHistorias,
  type DatosHistorias,
  type ErroresHistorias,
  type SectorId,
} from '../../domain/historias'

export type AccionGuardarHistorias = (entrada: DatosHistorias) => Promise<ResultadoGuardar<ErroresHistorias>>

type CampoDeTexto = 'logro' | 'problemaDificil' | 'problemaMundo'

// Orden en que aparecen los campos: el foco va al primero que tenga error
const ordenCampos = ['logro', 'problemaDificil', 'problemaMundo', 'sectores', 'aceptaAnalisis'] as const
const idDeCampo = (campo: (typeof ordenCampos)[number]) => (campo === 'sectores' ? 'campo-sector-0' : `campo-${campo}`)

/** `hrefSiguiente` es adónde va la persona en cuanto se guarda lo que escribió */
export function useHistorias(inicial: DatosHistorias, alGuardar: AccionGuardarHistorias, hrefSiguiente: string) {
  const router = useRouter()
  const [datos, setDatos] = useState<DatosHistorias>(inicial)
  const [errores, setErrores] = useState<ErroresHistorias>({})
  const [enviando, setEnviando] = useState(false)
  /** Ya se guardó y se está yendo al paso siguiente: no vuelve a enviarse */
  const [guardado, setGuardado] = useState(false)
  const [aviso, setAviso] = useState<'limite' | 'fallo' | undefined>()
  const [enfoque, setEnfoque] = useState<{ id: string } | undefined>()

  /** La casilla del permiso solo hace falta cuando hay algo escrito */
  const pidePermiso = hayTexto(datos)

  // Con errores a la vista, los ya corregidos desaparecen al cambiar; no aparecen errores nuevos hasta volver a enviar
  function revisar(nuevos: DatosHistorias) {
    if (!hayErroresHistorias(errores)) return
    const actuales = validarHistorias(nuevos)
    setErrores(Object.fromEntries(Object.entries(actuales).filter(([campo]) => campo in errores)) as ErroresHistorias)
  }

  function escribir(campo: CampoDeTexto, texto: string) {
    const nuevos = { ...datos, [campo]: texto }
    setDatos(nuevos)
    revisar(nuevos)
  }

  function elegirSector(sector: SectorId) {
    const nuevos = { ...datos, sectores: alternarSector(datos.sectores, sector) }
    setDatos(nuevos)
    revisar(nuevos)
  }

  function darPermiso(marcado: boolean) {
    const nuevos = { ...datos, aceptaAnalisis: marcado }
    setDatos(nuevos)
    revisar(nuevos)
  }

  function mostrarErrores(nuevos: ErroresHistorias) {
    const primero = ordenCampos.find((campo) => nuevos[campo])
    if (!primero) return
    setErrores(nuevos)
    setEnfoque({ id: idDeCampo(primero) })
  }

  async function enviar() {
    if (enviando || guardado) return
    setAviso(undefined)
    const encontrados = validarHistorias(datos)
    if (hayErroresHistorias(encontrados)) return mostrarErrores(encontrados)

    setEnviando(true)
    try {
      const resultado = await alGuardar(datos)
      if (resultado.ok) {
        setErrores({})
        setGuardado(true)
        router.push(hrefSiguiente)
      } else if (hayErroresHistorias(resultado.errores)) mostrarErrores(resultado.errores)
      else setAviso(resultado.motivo ?? 'fallo')
    } catch {
      setAviso('fallo')
    } finally {
      setEnviando(false)
    }
  }

  return { datos, errores, enviando, guardado, aviso, enfoque, pidePermiso, escribir, elegirSector, darPermiso, enviar }
}
