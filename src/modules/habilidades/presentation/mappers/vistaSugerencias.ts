import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import type { Nivel, Sugerencia, TareaId } from '../../domain/tarea'
import type { TextosHabilidades } from '../../language/tipos'

export type FilaSugerencia = {
  tarea: TareaId
  titulo: string
  fuente: string
  nivel: Nivel
  nivelTexto: string
}

/** Las sugerencias como las muestra la pantalla de revisión: con el nombre de la tarea y de la fuente en el idioma */
export function vistaSugerencias(sugerencias: Sugerencia[], textos: TextosHabilidades['escritas']): FilaSugerencia[] {
  return sugerencias.map((sugerencia) => ({
    tarea: sugerencia.tarea,
    titulo: textos.tareas[sugerencia.tarea],
    fuente: textos.revision.fuentes[sugerencia.fuente],
    nivel: sugerencia.nivel,
    nivelTexto: rellenarPlantilla(textos.revision.nivel, { nivel: sugerencia.nivel }),
  }))
}
