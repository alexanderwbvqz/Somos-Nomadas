import type { PerfilRepository } from '../domain/PerfilRepository'
import type { PerfilBienvenida } from '../domain/perfil'

// Lo que se guardó del perfil en la bienvenida. Si no hay nada guardado, o si no se puede leer, devuelve undefined:
// quien lo pide (por ejemplo para saludar por el nombre) debe poder seguir sin ello.
export async function obtenerPerfil(repositorio: PerfilRepository): Promise<PerfilBienvenida | undefined> {
  try {
    return await repositorio.obtenerBienvenida()
  } catch {
    return undefined
  }
}
