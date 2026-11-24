import type { Bienvenida } from './bienvenida'

export interface BienvenidaRepository {
  /**
   * Guarda la bienvenida del perfil de quien tiene la sesión abierta. Cuando exista la sesión real, este puerto
   * recibirá también de quién es; mientras tanto el adaptador simulado guarda un único perfil.
   */
  guardarBienvenida(perfil: Bienvenida): Promise<void>
  /** Lo que se guardó en la bienvenida, o undefined si todavía no se ha guardado nada */
  obtenerBienvenida(): Promise<Bienvenida | undefined>
}
