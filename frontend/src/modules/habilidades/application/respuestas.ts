import type { HabilidadId } from '../domain/catalogo'
import {
  hayErroresForma,
  limpiarForma,
  validarForma,
  type DatosForma,
  type EntradaForma,
  type ErroresForma,
} from '../domain/forma'
import {
  hayErroresHistorias,
  limpiarHistorias,
  validarHistorias,
  type DatosHistorias,
  type EntradaHistorias,
  type ErroresHistorias,
} from '../domain/historias'
import { habilidadesMasFuertes, type Marcas } from '../domain/perfilArea'
import type { RespuestasProfundizacion } from '../domain/preguntas'
import {
  calcularPerfil,
  hayErroresProfundizacion,
  respuestasVacias,
  validarProfundizacion,
  type ErroresProfundizacion,
  type PerfilCalculado,
  type RespuestasGuardadas,
} from '../domain/respuestas'
import type { RespuestasRepository } from '../domain/RespuestasRepository'

// Los casos de uso de las respuestas, uno por paso. Cada uno valida otra vez, en el servidor, lo que mandó el navegador.
// `fallo` es un error al guardar o leer; `limite` (demasiados intentos seguidos) lo pone quien recibe la petición.

export type ResultadoGuardar<Errores = Record<string, never>> =
  | { ok: true }
  | { ok: false; errores: Errores; motivo?: 'limite' | 'fallo' }

/** «Qué has hecho»: las tareas que marcó. Que sean tareas y veces conocidas lo comprueba quien lee la petición. */
export async function guardarTareas(repositorio: RespuestasRepository, marcas: Marcas): Promise<ResultadoGuardar> {
  try {
    await repositorio.guardarMarcas(marcas)
    return { ok: true }
  } catch {
    return { ok: false, errores: {}, motivo: 'fallo' }
  }
}

export type ErroresGuardarProfundizacion = {
  /** La habilidad no es de las más fuertes de la persona: no se le pregunta por ella */
  habilidad?: 'noEsFuerte'
  preguntas?: ErroresProfundizacion
}

/** «Más de lo que haces»: lo que cuenta de una de sus tres habilidades más fuertes */
export async function guardarProfundizacion(
  repositorio: RespuestasRepository,
  habilidad: HabilidadId,
  respuestas: RespuestasProfundizacion,
): Promise<ResultadoGuardar<ErroresGuardarProfundizacion>> {
  try {
    const { marcas } = await repositorio.obtener()
    if (!habilidadesMasFuertes(marcas).includes(habilidad)) return { ok: false, errores: { habilidad: 'noEsFuerte' } }

    const errores = validarProfundizacion(habilidad, respuestas)
    if (hayErroresProfundizacion(errores)) return { ok: false, errores: { preguntas: errores } }

    await repositorio.guardarProfundizacion(habilidad, respuestas)
    return { ok: true }
  } catch {
    return { ok: false, errores: {}, motivo: 'fallo' }
  }
}

/** «Tus historias» */
export async function guardarHistorias(repositorio: RespuestasRepository, entrada: EntradaHistorias): Promise<ResultadoGuardar<ErroresHistorias>> {
  const errores = validarHistorias(entrada)
  if (hayErroresHistorias(errores)) return { ok: false, errores }

  try {
    const historias: DatosHistorias = limpiarHistorias(entrada)
    await repositorio.guardarHistorias(historias)
    return { ok: true }
  } catch {
    return { ok: false, errores: {}, motivo: 'fallo' }
  }
}

/** «Tu forma de emprender» */
export async function guardarForma(repositorio: RespuestasRepository, entrada: EntradaForma): Promise<ResultadoGuardar<ErroresForma>> {
  const errores = validarForma(entrada)
  if (hayErroresForma(errores)) return { ok: false, errores }

  try {
    const forma: DatosForma = limpiarForma(entrada)
    await repositorio.guardarForma(forma)
    return { ok: true }
  } catch {
    return { ok: false, errores: {}, motivo: 'fallo' }
  }
}

/** Todo lo guardado, para que cada paso arranque con lo que ya se contó. Si no se puede leer, como si no hubiera nada. */
export async function obtenerRespuestas(repositorio: RespuestasRepository): Promise<RespuestasGuardadas> {
  try {
    return await repositorio.obtener()
  } catch {
    return respuestasVacias()
  }
}

export type ResultadoCierre = { ok: true; perfil: PerfilCalculado } | { ok: false; motivo: 'fallo' }

/** Al terminar: de todo lo contado, sus habilidades con puntos y su área */
export async function prepararCierre(repositorio: RespuestasRepository): Promise<ResultadoCierre> {
  try {
    return { ok: true, perfil: calcularPerfil(await repositorio.obtener()) }
  } catch {
    return { ok: false, motivo: 'fallo' }
  }
}
