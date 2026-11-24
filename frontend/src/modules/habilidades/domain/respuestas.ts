// Todo lo que la persona ha contado hasta ahora, y qué se saca de ello.

import type { HabilidadId } from './catalogo'
import type { DatosForma } from './forma'
import type { DatosHistorias } from './historias'
import { calcularArea, habilidadesMasFuertes, puntuar, type HabilidadPuntuada, type Marcas, type ResultadoArea, type Tiempos } from './perfilArea'
import { esRespuestaValida, preguntasDe, tiempoDeRespuestas, type RespuestasProfundizacion } from './preguntas'

export type RespuestasGuardadas = {
  /** Las tareas que marcó en «Qué has hecho» */
  marcas: Marcas
  /** Lo que contó de cada habilidad; puede haber de habilidades que ya no son de las más fuertes */
  profundizacion: Partial<Record<HabilidadId, RespuestasProfundizacion>>
  historias?: DatosHistorias
  forma?: DatosForma
}

export function respuestasVacias(): RespuestasGuardadas {
  return { marcas: {}, profundizacion: {} }
}

export type CodigoErrorProfundizacion = 'preguntaDesconocida' | 'respuestaInvalida'

/** Qué preguntas tienen problema, por su id */
export type ErroresProfundizacion = Record<string, CodigoErrorProfundizacion>

export function hayErroresProfundizacion(errores: object): boolean {
  return Object.keys(errores).length > 0
}

/** Cada respuesta debe ser de una pregunta de esa habilidad y una respuesta posible a ella */
export function validarProfundizacion(habilidad: HabilidadId, respuestas: Readonly<Record<string, unknown>>): ErroresProfundizacion {
  const preguntas = preguntasDe(habilidad)
  const errores: ErroresProfundizacion = {}
  for (const [id, valor] of Object.entries(respuestas)) {
    const pregunta = preguntas.find((candidata) => candidata.id === id)
    if (!pregunta) errores[id] = 'preguntaDesconocida'
    else if (!esRespuestaValida(pregunta, valor)) errores[id] = 'respuestaInvalida'
  }
  return errores
}

/** Solo cuentan las respuestas de las habilidades que hoy son las más fuertes, aunque antes se hubiera contado de otras */
export function tiemposDe(respuestas: RespuestasGuardadas): Tiempos {
  const tiempos: Tiempos = {}
  for (const habilidad of habilidadesMasFuertes(respuestas.marcas)) {
    const contadas = respuestas.profundizacion[habilidad]
    const tiempo = contadas === undefined ? undefined : tiempoDeRespuestas(contadas)
    if (tiempo !== undefined) tiempos[habilidad] = tiempo
  }
  return tiempos
}

export type PerfilCalculado = {
  habilidades: HabilidadPuntuada[]
  /** Sin tareas marcadas no hay área */
  area?: ResultadoArea
}

/** De lo que contó, sus habilidades con puntos y su área */
export function calcularPerfil(respuestas: RespuestasGuardadas): PerfilCalculado {
  const puntuadas = puntuar(respuestas.marcas, tiemposDe(respuestas))
  return { habilidades: puntuadas, area: calcularArea(puntuadas) }
}
