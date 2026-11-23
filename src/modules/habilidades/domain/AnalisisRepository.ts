import type { CampoEnlace } from './material'
import type { Sugerencia } from './tarea'

/** Lo que se le da a analizar, ya revisado */
export type MaterialParaAnalizar = {
  pdf?: { nombre: string; bytes: Uint8Array }
  enlaces: { campo: CampoEnlace; url: string }[]
}

export interface AnalisisRepository {
  /** Lee el material y propone qué tareas ha hecho la persona y con qué nivel. No guarda nada. */
  analizar(material: MaterialParaAnalizar): Promise<Sugerencia[]>
}
