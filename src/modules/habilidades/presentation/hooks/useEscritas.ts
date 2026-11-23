'use client'

import { useState } from 'react'
import type { ResultadoAnalisis } from '../../application/analizarMaterial'
import {
  datosMaterialVacios,
  errorDeArchivo,
  hayErroresMaterial,
  hayMaterial,
  validarMaterial,
  type CampoEnlace,
  type DatosMaterial,
  type ErroresMaterial,
} from '../../domain/material'
import type { Sugerencia, TareaId } from '../../domain/tarea'

/** Lo que se manda al servidor es un formulario con el archivo dentro, no un objeto: así viaja el PDF */
export type AccionAnalizar = (entrada: FormData) => Promise<ResultadoAnalisis>

export type Fase = 'pegar' | 'leyendo' | 'revisar'

// Orden en que aparecen los campos: el foco va al primero que tenga error
const ordenCampos = ['material', 'archivo', 'web', 'github', 'otro', 'aceptaAnalisis'] as const
const idDeCampo = (campo: (typeof ordenCampos)[number]) => (campo === 'material' || campo === 'archivo' ? 'campo-pdf' : `campo-${campo}`)

/** Los errores sin los de esos campos (la clave se quita: un error con valor vacío contaría como error) */
function sinErrorDe(errores: ErroresMaterial, ...campos: (keyof ErroresMaterial)[]): ErroresMaterial {
  return Object.fromEntries(Object.entries(errores).filter(([campo]) => !campos.includes(campo as keyof ErroresMaterial))) as ErroresMaterial
}

export function useEscritas(alAnalizar: AccionAnalizar) {
  const [fase, setFase] = useState<Fase>('pegar')
  const [datos, setDatos] = useState<DatosMaterial>(datosMaterialVacios)
  // El archivo en sí (el dominio solo conoce sus datos)
  const [archivo, setArchivo] = useState<File | undefined>()
  const [errores, setErrores] = useState<ErroresMaterial>({})
  const [aviso, setAviso] = useState<'limite' | 'fallo' | undefined>()
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([])
  const [confirmadas, setConfirmadas] = useState<TareaId[]>([])
  /** Ya confirmó: mientras no exista el paso siguiente, se le avisa de que llega pronto */
  const [terminado, setTerminado] = useState(false)
  const [enfoque, setEnfoque] = useState<{ id: string } | undefined>()

  // Con errores a la vista, los ya corregidos desaparecen al cambiar; no aparecen errores nuevos hasta volver a enviar
  function revisar(nuevos: DatosMaterial) {
    if (!hayErroresMaterial(errores)) return
    const actuales = validarMaterial(nuevos)
    setErrores(Object.fromEntries(Object.entries(actuales).filter(([campo]) => campo in errores && campo !== 'archivo')) as ErroresMaterial)
  }

  function elegirArchivo(elegido: File) {
    const meta = { nombre: elegido.name, tamano: elegido.size, tipo: elegido.type }
    const error = errorDeArchivo(meta)
    if (error) {
      // Un archivo que no sirve no se queda: el error se ve donde se eligió
      setArchivo(undefined)
      setDatos((actuales) => ({ ...actuales, archivo: undefined }))
      setErrores((actuales) => ({ ...actuales, archivo: error }))
      return
    }
    setArchivo(elegido)
    const nuevos = { ...datos, archivo: meta }
    setDatos(nuevos)
    setErrores((actuales) => sinErrorDe(actuales, 'archivo', 'material'))
  }

  function quitarArchivo() {
    setArchivo(undefined)
    setDatos((actuales) => ({ ...actuales, archivo: undefined }))
    setErrores((actuales) => sinErrorDe(actuales, 'archivo'))
  }

  function cambiarEnlace(campo: CampoEnlace, valor: string) {
    const nuevos = { ...datos, [campo]: valor }
    setDatos(nuevos)
    revisar(nuevos)
  }

  function marcarPermiso(marcado: boolean) {
    const nuevos = { ...datos, aceptaAnalisis: marcado }
    setDatos(nuevos)
    revisar(nuevos)
  }

  function mostrarErrores(nuevos: ErroresMaterial) {
    const primero = ordenCampos.find((campo) => nuevos[campo])
    if (!primero) return
    setErrores(nuevos)
    setEnfoque({ id: idDeCampo(primero) })
  }

  async function analizar() {
    if (fase !== 'pegar') return
    setAviso(undefined)
    const encontrados = validarMaterial(datos)
    if (hayErroresMaterial(encontrados)) return mostrarErrores(encontrados)

    const formulario = new FormData()
    if (archivo) formulario.set('pdf', archivo)
    formulario.set('web', datos.web)
    formulario.set('github', datos.github)
    formulario.set('otro', datos.otro)
    formulario.set('aceptaAnalisis', 'true')

    setErrores({})
    setFase('leyendo')
    try {
      const resultado = await alAnalizar(formulario)
      if (resultado.ok) {
        setSugerencias(resultado.sugerencias)
        setConfirmadas(resultado.sugerencias.map((sugerencia) => sugerencia.tarea))
        setFase('revisar')
        return
      }
      setFase('pegar')
      if (hayErroresMaterial(resultado.errores)) mostrarErrores(resultado.errores)
      else setAviso(resultado.motivo ?? 'fallo')
    } catch {
      setFase('pegar')
      setAviso('fallo')
    }
  }

  function volver() {
    setTerminado(false)
    setFase('pegar')
  }

  function alternarTarea(tarea: TareaId) {
    setConfirmadas((actuales) => (actuales.includes(tarea) ? actuales.filter((actual) => actual !== tarea) : [...actuales, tarea]))
  }

  /** Para encender el botón: algo subido o pegado y el permiso dado (lo demás se avisa al enviar) */
  const puedeAnalizar = hayMaterial(datos) && datos.aceptaAnalisis

  return {
    fase,
    datos,
    archivo,
    errores,
    aviso,
    sugerencias,
    confirmadas,
    terminado,
    enfoque,
    puedeAnalizar,
    elegirArchivo,
    quitarArchivo,
    cambiarEnlace,
    marcarPermiso,
    analizar,
    volver,
    alternarTarea,
    confirmar: () => setTerminado(true),
  }
}
