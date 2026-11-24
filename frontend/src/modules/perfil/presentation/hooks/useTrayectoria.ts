'use client'

import { useState } from 'react'
import type { ResultadoGuardar } from '../../application/resultado'
import {
  hayErroresTrayectoria,
  LIMITES_TRAYECTORIA,
  limpiarTrayectoria,
  validarEntradaTrayectoria,
  type EntradaTrayectoria,
  type EntradaTrayectoriaForm,
  type ErroresEntradaTrayectoria,
  type ErroresTrayectoria,
} from '../../domain/trayectoria'

export type AccionGuardarTrayectoria = (entrada: { entradas: EntradaTrayectoriaForm[] }) => Promise<ResultadoGuardar<ErroresTrayectoria>>

const entradaVacia: EntradaTrayectoriaForm = { desde: '', hasta: '', rol: '', donde: '', que: '' }

function comoFormulario(entrada: EntradaTrayectoria): EntradaTrayectoriaForm {
  return { desde: String(entrada.desde), hasta: entrada.hasta === undefined ? '' : String(entrada.hasta), rol: entrada.rol, donde: entrada.donde, que: entrada.que }
}

/**
 * «Trayectoria»: cada vez que se suma o se quita una entrada se guarda la lista entera. El año actual lo da quien llama
 * (por defecto, el de hoy en el navegador).
 */
export function useTrayectoria(inicial: EntradaTrayectoria[], alGuardar: AccionGuardarTrayectoria, anioActual: number = new Date().getFullYear()) {
  const [entradas, setEntradas] = useState(inicial)
  const [editando, setEditando] = useState(false)
  const [nueva, setNueva] = useState<EntradaTrayectoriaForm>(entradaVacia)
  const [errores, setErrores] = useState<ErroresEntradaTrayectoria>({})
  const [listaLlena, setListaLlena] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState<'limite' | 'fallo' | undefined>()

  function abrir() {
    setErrores({})
    setListaLlena(false)
    setAviso(undefined)
    setEditando(true)
  }

  function cerrar() {
    setEditando(false)
    setNueva(entradaVacia)
    setErrores({})
    setListaLlena(false)
    setAviso(undefined)
  }

  function cambiar(campo: keyof EntradaTrayectoriaForm, valor: string) {
    setNueva((actual) => ({ ...actual, [campo]: valor }))
    if (errores[campo]) setErrores((actuales) => ({ ...actuales, [campo]: undefined }))
  }

  /** Guarda la lista entera; devuelve si salió bien */
  async function guardarLista(lista: EntradaTrayectoriaForm[]): Promise<ResultadoGuardar<ErroresTrayectoria> | undefined> {
    setGuardando(true)
    setAviso(undefined)
    try {
      const resultado = await alGuardar({ entradas: lista })
      if (resultado.ok) setEntradas(limpiarTrayectoria(lista))
      else if (!hayErroresTrayectoria(resultado.errores)) setAviso(resultado.motivo ?? 'fallo')
      return resultado
    } catch {
      setAviso('fallo')
      return undefined
    } finally {
      setGuardando(false)
    }
  }

  async function agregar() {
    if (guardando) return
    if (entradas.length >= LIMITES_TRAYECTORIA.entradas) {
      setListaLlena(true)
      return
    }
    const encontrados = validarEntradaTrayectoria(nueva, anioActual)
    if (Object.keys(encontrados).length > 0) {
      setErrores(encontrados)
      return
    }

    const lista = [...entradas.map(comoFormulario), nueva]
    const resultado = await guardarLista(lista)
    if (resultado?.ok) {
      setNueva(entradaVacia)
      setErrores({})
    } else if (resultado && hayErroresTrayectoria(resultado.errores)) {
      // El servidor la rechazó aunque el navegador la dio por buena: se enseña lo que dice, en la entrada nueva
      if (resultado.errores.lista) setListaLlena(true)
      setErrores(resultado.errores.entradas[lista.length - 1] ?? {})
    }
  }

  async function quitar(lugar: number) {
    if (guardando) return
    await guardarLista(entradas.filter((_, i) => i !== lugar).map(comoFormulario))
  }

  return { entradas, editando, nueva, errores, listaLlena, guardando, aviso, abrir, cerrar, cambiar, agregar, quitar }
}
