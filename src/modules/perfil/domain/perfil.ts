// El perfil de una persona tal como lo devuelve el backend: ya armado y listo para mostrar (los textos de las preguntas y de las
// opciones vienen resueltos). Aquí solo está su forma y lo poco que se calcula sobre ella.

import type { EntradaTrayectoria } from './trayectoria'

export type FichaPerfil = {
  nombre: string
  apellidos: string
  ciudad: string
  /** El nombre del país, ya en texto */
  pais: string
  iniciales: string
  /** El área en la que cae la persona; más de una si empata */
  areas: string[]
  /** Cómo prefiere trabajar, de «Tu forma de emprender»; falta si no lo contestó */
  modalidad?: string
}

/** Una pregunta con lo que se contestó: una o varias opciones */
export type RespuestaPerfil = { pregunta: string; respuestas: string[] }

/** Una pregunta de texto libre con lo que se escribió */
export type TextoPerfil = { pregunta: string; texto: string }

export type HabilidadPerfil = {
  nombre: string
  /** De 1 a 5 */
  nivel: number
  /** Sin el tiempo que lleva con la habilidad el nivel es estimado, y llega como mucho a 3 */
  estimado: boolean
  /** Por ejemplo «Es mi trabajo · Más de 5 años» */
  resumen: string
  /** Solo las habilidades más fuertes: lo que la persona contó de ella */
  detalle?: { respuestas: RespuestaPerfil[]; texto?: TextoPerfil }
}

export type TareaPerfil = { texto: string; veces: string }

export type GrupoTareasPerfil = { grupo: string; tareas: TareaPerfil[] }

export type Perfil = {
  ficha: FichaPerfil
  /** Lo que marcó en la bienvenida en «Qué estás buscando» */
  buscando: string[]
  /** Las habilidades más fuertes, de más a menos */
  habilidades: HabilidadPerfil[]
  /** Las tareas que marcó, por grupo, y cuántas hay en total para elegir */
  tareas: { total: number; grupos: GrupoTareasPerfil[] }
  historias: TextoPerfil[]
  sectores: string[]
  forma: RespuestaPerfil[]
  /** Las áreas del equipo que busca */
  buscaPerfil: string[]
  socioIdeal: string
  /** Lo que la persona escribe en el propio perfil; vacío si no escribió nada */
  sobreMi: string
  trayectoria: EntradaTrayectoria[]
  evidencia: string[]
}

export type CapaId = 'recorrido' | 'sobreMi' | 'evidencia'

export type CapaPerfil = { id: CapaId; hecha: boolean }

/**
 * Las partes que hacen completo un perfil. La trayectoria no cuenta: es opcional, y quien no ha tenido trabajo formal
 * no debe sentir que le falta algo.
 */
export function capasDelPerfil(perfil: Perfil): CapaPerfil[] {
  return [
    { id: 'recorrido', hecha: perfil.tareas.grupos.some((grupo) => grupo.tareas.length > 0) },
    { id: 'sobreMi', hecha: perfil.sobreMi.trim() !== '' },
    { id: 'evidencia', hecha: perfil.evidencia.length > 0 },
  ]
}
