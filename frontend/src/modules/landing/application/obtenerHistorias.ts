import type { Historia } from '../domain/Historia'
import type { HistoriasRepository } from '../domain/HistoriasRepository'
import { historiasPublicables } from '../domain/historias'

export type ResultadoHistorias = { ok: true; historias: Historia[] } | { ok: false; motivo: 'fallo' }

/** Las historias que se pueden publicar. Si el adaptador falla se dice, y la landing sigue sin esa sección. */
export async function obtenerHistorias(repositorio: HistoriasRepository, idioma: string, anioActual: number): Promise<ResultadoHistorias> {
  try {
    return { ok: true, historias: historiasPublicables(await repositorio.obtener(idioma), anioActual) }
  } catch {
    return { ok: false, motivo: 'fallo' }
  }
}
