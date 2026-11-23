'use client'

import { useState } from 'react'
import type { ResultadoBienvenida } from '../../application/guardarBienvenida'
import {
  alternarBusqueda,
  datosBienvenidaVacios,
  hayErroresPerfil,
  validarBienvenida,
  type Busqueda,
  type DatosBienvenida,
  type ErroresBienvenida,
} from '../../domain/perfil'

export type AccionGuardarBienvenida = (datos: DatosBienvenida) => Promise<ResultadoBienvenida>

// Orden en que aparecen los campos: el foco va al primero que tenga error
const ordenCampos = ['nombre', 'apellidos', 'pais', 'ciudad', 'busca'] as const
const idDeCampo = (campo: (typeof ordenCampos)[number]) => (campo === 'busca' ? 'campo-busca-0' : `campo-${campo}`)

export function useBienvenida(alGuardar: AccionGuardarBienvenida) {
  const [datos, setDatos] = useState<DatosBienvenida>(datosBienvenidaVacios)
  const [errores, setErrores] = useState<ErroresBienvenida>({})
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState<'limite' | 'fallo' | undefined>()
  /** El nombre con el que se guardó; mientras no exista el directorio, es lo único que se muestra después */
  const [nombreGuardado, setNombreGuardado] = useState<string | undefined>()
  const [enfoque, setEnfoque] = useState<{ id: string } | undefined>()

  // Con errores a la vista, los ya corregidos desaparecen al cambiar; no aparecen errores nuevos hasta volver a enviar
  function revisar(nuevos: DatosBienvenida) {
    if (!hayErroresPerfil(errores)) return
    const actuales = validarBienvenida(nuevos)
    setErrores(Object.fromEntries(Object.entries(actuales).filter(([campo]) => campo in errores)) as ErroresBienvenida)
  }

  function cambiar<K extends 'nombre' | 'apellidos' | 'pais' | 'ciudad'>(campo: K, valor: DatosBienvenida[K]) {
    const nuevos = { ...datos, [campo]: valor }
    setDatos(nuevos)
    revisar(nuevos)
  }

  function alternar(opcion: Busqueda) {
    const nuevos = { ...datos, busca: alternarBusqueda(datos.busca, opcion) }
    setDatos(nuevos)
    revisar(nuevos)
  }

  function mostrarErrores(nuevos: ErroresBienvenida) {
    const primero = ordenCampos.find((campo) => nuevos[campo])
    if (!primero) return
    setErrores(nuevos)
    setEnfoque({ id: idDeCampo(primero) })
  }

  async function enviar() {
    if (enviando) return
    setAviso(undefined)
    const encontrados = validarBienvenida(datos)
    if (hayErroresPerfil(encontrados)) return mostrarErrores(encontrados)

    setEnviando(true)
    try {
      const resultado = await alGuardar(datos)
      if (resultado.ok) {
        setErrores({})
        setNombreGuardado(resultado.nombre)
      } else if (hayErroresPerfil(resultado.errores)) mostrarErrores(resultado.errores)
      else setAviso(resultado.motivo ?? 'fallo')
    } catch {
      setAviso('fallo')
    } finally {
      setEnviando(false)
    }
  }

  /** El botón de enviar solo se activa cuando no falta nada */
  const completo = !hayErroresPerfil(validarBienvenida(datos))

  return { datos, errores, enviando, aviso, nombreGuardado, enfoque, completo, cambiar, alternar, enviar }
}
