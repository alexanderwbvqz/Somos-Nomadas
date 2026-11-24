import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import type { HabilidadId } from '../../domain/catalogo'
import type { Marcas } from '../../domain/perfilArea'
import { preguntasDe, tiempoDeRespuestas, type Pregunta, type RespuestasProfundizacion } from '../../domain/preguntas'
import type { TextosHabilidades } from '../../language/tipos'

export type OpcionVista = { id: string; texto: string; marcada: boolean }

export type PreguntaVista =
  | { id: string; tipo: 'una' | 'varias'; titulo: string; opciones: OpcionVista[] }
  | { id: string; tipo: 'texto'; titulo: string; ejemplo: string; valor: string }

export type SeccionVista = {
  habilidad: HabilidadId
  nombre: string
  /** Su lugar entre las habilidades que se preguntan, empezando en 1 */
  numero: number
  total: number
  /** Cuántas veces dijo que la hizo, en minúscula: «es mi trabajo» */
  veces: string
  /** Ya contestó cuánto tiempo lleva con ella: con eso se da por contada */
  lista: boolean
  /** Lo contestado en pocas palabras, para enseñarlo con la sección cerrada */
  resumen: string
  preguntas: PreguntaVista[]
}

/** Una pregunta con su enunciado en el idioma, nombrando la habilidad de la que habla */
function enunciado(textos: TextosHabilidades['profundizar'], habilidad: HabilidadId, pregunta: Pregunta): { titulo: string; ejemplo: string } {
  const nombre = textos.habilidades[habilidad].toLocaleLowerCase()
  const p = textos.preguntas
  switch (pregunta.id) {
    case 'tiempo':
      return { titulo: rellenarPlantilla(p.tiempo, { habilidad: nombre }), ejemplo: '' }
    case 'quien':
      return { titulo: rellenarPlantilla(p.quien, { habilidad: nombre }), ejemplo: '' }
    case 'texto': {
      const propio = p.textoPropio[habilidad]
      if (propio) return { titulo: propio.pregunta, ejemplo: propio.ejemplo }
      return {
        titulo: rellenarPlantilla(p.textoGenerico.pregunta, { habilidad: nombre }),
        ejemplo: rellenarPlantilla(p.textoGenerico.ejemplo, { habilidad: nombre }),
      }
    }
    default:
      return { titulo: p.propias[pregunta.id] ?? pregunta.id, ejemplo: '' }
  }
}

function resumenDe(textos: TextosHabilidades['profundizar'], habilidad: HabilidadId, respuestas: RespuestasProfundizacion): string {
  const opciones = textos.preguntas.opciones
  const partes = preguntasDe(habilidad).flatMap((pregunta) => {
    if (pregunta.tipo !== 'varias') return []
    const elegidas = respuestas[pregunta.id]
    return Array.isArray(elegidas) ? elegidas.slice(0, 4).map((opcion) => opciones[opcion] ?? opcion) : []
  })
  const tiempo = tiempoDeRespuestas(respuestas)
  if (tiempo !== undefined) partes.push(opciones[tiempo] ?? tiempo)
  return partes.join(' · ')
}

/** Las habilidades que se profundizan como las muestra la pantalla: preguntas con sus textos, lo contestado y si ya está lista */
export function vistaSecciones(
  textos: TextosHabilidades,
  fuertes: readonly HabilidadId[],
  marcas: Marcas,
  respuestas: Partial<Record<HabilidadId, RespuestasProfundizacion>>,
): SeccionVista[] {
  const t = textos.profundizar
  return fuertes.map((habilidad, indice) => {
    const contadas = respuestas[habilidad] ?? {}
    const frecuencia = marcas[habilidad]
    const preguntas = preguntasDe(habilidad).map((pregunta): PreguntaVista => {
      const { titulo, ejemplo } = enunciado(t, habilidad, pregunta)
      const valor = contadas[pregunta.id]
      if (pregunta.tipo === 'texto') return { id: pregunta.id, tipo: 'texto', titulo, ejemplo, valor: typeof valor === 'string' ? valor : '' }
      const elegidas = Array.isArray(valor) ? valor : typeof valor === 'string' ? [valor] : []
      return {
        id: pregunta.id,
        tipo: pregunta.tipo,
        titulo,
        opciones: pregunta.opciones.map((opcion) => ({ id: opcion, texto: t.preguntas.opciones[opcion] ?? opcion, marcada: elegidas.includes(opcion) })),
      }
    })
    const lista = tiempoDeRespuestas(contadas) !== undefined
    return {
      habilidad,
      nombre: t.habilidades[habilidad],
      numero: indice + 1,
      total: fuertes.length,
      veces: frecuencia === undefined ? '' : textos.tareas.frecuencias[frecuencia].toLocaleLowerCase(),
      lista,
      resumen: lista ? resumenDe(t, habilidad, contadas) : '',
      preguntas,
    }
  })
}
