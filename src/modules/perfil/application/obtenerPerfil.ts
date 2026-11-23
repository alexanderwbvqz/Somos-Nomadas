import type { Perfil } from '../domain/perfil'
import type { PerfilRepository } from '../domain/PerfilRepository'

export type ResultadoPerfil = { ok: true; perfil: Perfil } | { ok: false; motivo: 'fallo' }

/** El perfil entero. Si no se puede leer se dice, porque no hay un perfil vacío con el que seguir. */
export async function obtenerPerfil(repositorio: PerfilRepository): Promise<ResultadoPerfil> {
  try {
    return { ok: true, perfil: await repositorio.obtener() }
  } catch {
    return { ok: false, motivo: 'fallo' }
  }
}
