import type { BienvenidaRepository } from '../domain/BienvenidaRepository'
import type { Bienvenida } from '../domain/bienvenida'

// Lo que se guardó del perfil en la bienvenida. Si no hay nada guardado, o si no se puede leer, devuelve undefined:
// quien lo pide (por ejemplo para saludar por el nombre) debe poder seguir sin ello.
export async function obtenerBienvenida(repositorio: BienvenidaRepository): Promise<Bienvenida | undefined> {
  try {
    return await repositorio.obtenerBienvenida()
  } catch {
    return undefined
  }
}
