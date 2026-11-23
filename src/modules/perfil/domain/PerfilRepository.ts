import type { EntradaTrayectoria } from './trayectoria'
import type { Perfil } from './perfil'

export interface PerfilRepository {
  /**
   * El perfil entero de quien tiene la sesión abierta. Cuando exista la sesión real, este puerto recibirá también de quién es,
   * y el idioma en que se quieren los textos de las preguntas; mientras tanto el adaptador simulado devuelve uno solo.
   */
  obtener(): Promise<Perfil>
  /** Lo que se guarda ya está revisado por el dominio */
  guardarSobreMi(texto: string): Promise<void>
  guardarTrayectoria(entradas: EntradaTrayectoria[]): Promise<void>
  guardarEvidencia(enlaces: string[]): Promise<void>
}
