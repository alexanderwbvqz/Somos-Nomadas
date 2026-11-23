// «Tu forma de emprender»: seis preguntas de elegir entre dos o tres cosas, el perfil que busca para su equipo y cómo es su
// socio ideal. No sirve para decidir de qué área es la persona sino para proponerle personas que trabajen a su ritmo.
// Todo es opcional. Aquí solo van los identificadores; los textos están en el idioma de cada persona.

import { esArea, type AreaId, areas } from './catalogo'

export const preguntasForma = [
  { id: 'dedicacion', opciones: ['menosDe10', 'de10a20', 'masDe20'] },
  { id: 'arranque', opciones: ['yaMismo', 'enUnosMeses', 'cuandoAparezca'] },
  { id: 'modalidad', opciones: ['presencial', 'remota', 'hibrida'] },
  { id: 'decision', opciones: ['rapido', 'conDatos', 'depende'] },
  { id: 'riesgo', opciones: ['arriesgo', 'equilibrio', 'seguro'] },
  { id: 'ritmo', opciones: ['intenso', 'constante', 'flexible'] },
] as const
export type PreguntaFormaId = (typeof preguntasForma)[number]['id']

export const LIMITE_SOCIO_IDEAL = 800

export type DatosForma = {
  /** Lo que contestó; las que saltó no están */
  respuestas: Partial<Record<PreguntaFormaId, string>>
  /** Las áreas del equipo que busca */
  busca: AreaId[]
  socioIdeal: string
}

/** Lo mismo, tal como llega del navegador */
export type EntradaForma = { respuestas: Readonly<Record<string, string>>; busca: readonly string[]; socioIdeal: string }

export function datosFormaVacios(): DatosForma {
  return { respuestas: {}, busca: [], socioIdeal: '' }
}

export type CodigoErrorForma = 'respuestaInvalida' | 'areaInvalida' | 'textoLargo'

export type ErroresForma = Partial<Record<'respuestas' | 'busca' | 'socioIdeal', CodigoErrorForma>>

export function hayErroresForma(errores: object): boolean {
  return Object.keys(errores).length > 0
}

export function validarForma(datos: EntradaForma): ErroresForma {
  const errores: ErroresForma = {}

  const todasValidas = Object.entries(datos.respuestas).every(([id, valor]) => {
    const pregunta = preguntasForma.find((candidata) => candidata.id === id)
    return pregunta !== undefined && (pregunta.opciones as readonly string[]).includes(valor)
  })
  if (!todasValidas) errores.respuestas = 'respuestaInvalida'

  if (!datos.busca.every(esArea) || new Set(datos.busca).size !== datos.busca.length) errores.busca = 'areaInvalida'
  if (datos.socioIdeal.trim().length > LIMITE_SOCIO_IDEAL) errores.socioIdeal = 'textoLargo'
  return errores
}

/** Solo se llama con datos que ya pasaron `validarForma`: deja las áreas en el orden de la lista y recorta el texto */
export function limpiarForma(datos: EntradaForma): DatosForma {
  const respuestas: Partial<Record<PreguntaFormaId, string>> = {}
  for (const pregunta of preguntasForma) {
    const valor = datos.respuestas[pregunta.id]
    if (valor !== undefined) respuestas[pregunta.id] = valor
  }
  return { respuestas, busca: areas.filter((area) => datos.busca.includes(area)), socioIdeal: datos.socioIdeal.trim() }
}
