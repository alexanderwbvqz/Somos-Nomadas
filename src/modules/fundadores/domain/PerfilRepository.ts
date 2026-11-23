import type { PerfilBienvenida } from './perfil'

export interface PerfilRepository {
  /**
   * Guarda la bienvenida del perfil de quien tiene la sesión abierta. Cuando exista la sesión real, este puerto
   * recibirá también de quién es; mientras tanto el adaptador simulado guarda un único perfil.
   */
  guardarBienvenida(perfil: PerfilBienvenida): Promise<void>
}
