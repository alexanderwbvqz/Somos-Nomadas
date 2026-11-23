import { grupos, habilidadesPorGrupo, type GrupoId, type HabilidadId } from '../../domain/catalogo'
import type { Marcas } from '../../domain/perfilArea'
import type { Frecuencia } from '../../domain/puntos'
import type { TextosHabilidades } from '../../language/tipos'

export type FilaTarea = {
  habilidad: HabilidadId
  texto: string
  /** Cuántas veces la hizo; sin ella, la tarea no está marcada */
  frecuencia?: Frecuencia
}

export type GrupoTareas = {
  grupo: GrupoId
  titulo: string
  marcadas: number
  total: number
  abierto: boolean
  tareas: FilaTarea[]
}

/** Los grupos de tareas como los muestra la pantalla: con los textos en el idioma, cuántas hay marcadas y si están abiertos */
export function vistaTareas(textos: TextosHabilidades['tareas'], marcas: Marcas, abiertos: readonly GrupoId[]): GrupoTareas[] {
  return grupos.map((grupo) => {
    const tareas = habilidadesPorGrupo[grupo].map((habilidad) => ({ habilidad, texto: textos.tareas[habilidad], frecuencia: marcas[habilidad] }))
    return {
      grupo,
      titulo: textos.grupos[grupo],
      marcadas: tareas.filter((tarea) => tarea.frecuencia !== undefined).length,
      total: tareas.length,
      abierto: abiertos.includes(grupo),
      tareas,
    }
  })
}

/** Al llegar, está abierto el primer grupo y los que ya tienen tareas marcadas */
export function gruposAbiertosAlEmpezar(marcas: Marcas): GrupoId[] {
  const primero = grupos[0]
  return grupos.filter((grupo) => grupo === primero || habilidadesPorGrupo[grupo].some((habilidad) => marcas[habilidad] !== undefined))
}
