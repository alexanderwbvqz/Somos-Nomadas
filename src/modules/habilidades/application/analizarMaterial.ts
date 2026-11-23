import type { AnalisisRepository } from '../domain/AnalisisRepository'
import { hayErroresMaterial, limpiarEnlaces, validarMaterial, type DatosMaterial, type ErroresMaterial } from '../domain/material'
import type { Sugerencia } from '../domain/tarea'

export type ResultadoAnalisis =
  | { ok: true; sugerencias: Sugerencia[] }
  | {
      ok: false
      /** Qué campos tienen problema; vacío si el fallo no es de los datos */
      errores: ErroresMaterial
      /** limite: demasiados intentos seguidos; fallo: no se pudo analizar */
      motivo?: 'limite' | 'fallo'
    }

type Entrada = {
  datos: DatosMaterial
  /** El contenido del PDF, si se subió uno */
  bytes?: Uint8Array
}

// Valida otra vez, en el servidor, lo que mandó el navegador; si todo está bien pide el análisis.
export async function analizarMaterial(repositorio: AnalisisRepository, { datos, bytes }: Entrada): Promise<ResultadoAnalisis> {
  const errores = validarMaterial(datos)
  if (hayErroresMaterial(errores)) return { ok: false, errores }

  try {
    const sugerencias = await repositorio.analizar({
      pdf: datos.archivo && bytes ? { nombre: datos.archivo.nombre, bytes } : undefined,
      enlaces: limpiarEnlaces(datos),
    })
    return { ok: true, sugerencias }
  } catch {
    return { ok: false, errores: {}, motivo: 'fallo' }
  }
}
