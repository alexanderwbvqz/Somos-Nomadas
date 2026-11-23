// Las preguntas con las que se profundiza en cada una de las habilidades más fuertes. Unas pocas habilidades tienen
// preguntas propias (si programa, qué tecnologías usa); las demás usan las genéricas. Aquí solo van los identificadores:
// los textos de las preguntas y de cada opción están en el idioma de cada persona.

import type { HabilidadId } from './catalogo'
import { esTiempoPractica, tiemposPractica, type TiempoPractica } from './puntos'

export type PreguntaDeOpciones = {
  id: string
  /** una: se elige una sola · varias: se pueden elegir varias */
  tipo: 'una' | 'varias'
  opciones: readonly string[]
}
export type PreguntaDeTexto = { id: string; tipo: 'texto' }
export type Pregunta = PreguntaDeOpciones | PreguntaDeTexto

/** Lo que se contestó: el id de cada pregunta con su respuesta (un texto, o una lista de opciones) */
export type RespuestasProfundizacion = Record<string, string | string[]>

export const LIMITE_TEXTO = 800

/** La pregunta del tiempo está en todas las habilidades: de ella sale el nivel y con ella se da la habilidad por contada */
export const ID_TIEMPO = 'tiempo'

const tiempo: PreguntaDeOpciones = { id: ID_TIEMPO, tipo: 'una', opciones: tiemposPractica }
const texto: PreguntaDeTexto = { id: 'texto', tipo: 'texto' }

const genericas: readonly Pregunta[] = [
  { id: 'quien', tipo: 'varias', opciones: ['propioProyecto', 'empresa', 'clientesPorCuenta', 'universidadOCursos'] },
  tiempo,
  texto,
]

// inventado: ejemplos de preguntas propias para cuatro habilidades; el resto usa las genéricas
const propias: Partial<Record<HabilidadId, readonly Pregunta[]>> = {
  desarrolloWeb: [
    { id: 'tecnologias', tipo: 'varias', opciones: ['htmlCss', 'javascript', 'react', 'vueAngular', 'node', 'python', 'php', 'wordpress', 'otras'] },
    { id: 'parte', tipo: 'una', opciones: ['visual', 'servidor', 'ambas'] },
    tiempo,
    { id: 'proyecto', tipo: 'una', opciones: ['si', 'no'] },
    texto,
  ],
  marketingDigital: [
    { id: 'canales', tipo: 'varias', opciones: ['meta', 'googleAds', 'correo', 'redesOrganicas', 'tiktok', 'influencers', 'whatsapp', 'otros'] },
    { id: 'presupuesto', tipo: 'una', opciones: ['ninguno', 'hasta1000', 'masDe1000'] },
    { id: 'metricas', tipo: 'varias', opciones: ['alcance', 'clics', 'ventasGeneradas', 'costoPorCliente', 'retorno'] },
    tiempo,
    texto,
  ],
  ventas: [
    { id: 'aQuien', tipo: 'una', opciones: ['empresas', 'personas', 'ambos'] },
    { id: 'canal', tipo: 'varias', opciones: ['reuniones', 'llamadas', 'enLinea', 'tiendaOCalle', 'eventos'] },
    { id: 'metas', tipo: 'una', opciones: ['conMetas', 'sinMetas', 'aun'] },
    tiempo,
    texto,
  ],
  inteligenciaArtificial: [
    { id: 'tipo', tipo: 'varias', opciones: ['chatbots', 'analisisDatos', 'vision', 'automatizar', 'entrenar', 'otro'] },
    { id: 'uso', tipo: 'una', opciones: ['conUsuarios', 'pruebas', 'estudiando'] },
    tiempo,
    texto,
  ],
}

export function preguntasDe(habilidad: HabilidadId): readonly Pregunta[] {
  return propias[habilidad] ?? genericas
}

export function tienePreguntasPropias(habilidad: HabilidadId): boolean {
  return propias[habilidad] !== undefined
}

/** Si lo que se contestó es una respuesta posible a esa pregunta: una opción de las suyas, varias sin repetir, o un texto no demasiado largo */
export function esRespuestaValida(pregunta: Pregunta, valor: unknown): boolean {
  switch (pregunta.tipo) {
    case 'texto':
      return typeof valor === 'string' && valor.length <= LIMITE_TEXTO
    case 'una':
      return typeof valor === 'string' && pregunta.opciones.includes(valor)
    case 'varias':
      return (
        Array.isArray(valor) &&
        valor.every((opcion) => typeof opcion === 'string' && pregunta.opciones.includes(opcion)) &&
        new Set(valor).size === valor.length
      )
  }
}

/** El tiempo que lleva con la habilidad, si ya lo contestó */
export function tiempoDeRespuestas(respuestas: RespuestasProfundizacion): TiempoPractica | undefined {
  const valor = respuestas[ID_TIEMPO]
  return esTiempoPractica(valor) ? valor : undefined
}
