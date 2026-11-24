import type { PostulacionRepository } from '../../domain/PostulacionRepository'
import type { PostulacionLimpia } from '../../domain/postulacion'

// simulado: no guarda en ninguna parte ni envía correos; solo recuerda las postulaciones en memoria mientras
// el servidor está encendido. Se sustituye por el adaptador real cuando exista el backend.
const recibidas: PostulacionLimpia[] = []

export class MockPostulacionRepository implements PostulacionRepository {
  async enviar(postulacion: PostulacionLimpia): Promise<void> {
    recibidas.push(postulacion)
  }

  /** Solo para pruebas */
  static recibidas(): readonly PostulacionLimpia[] {
    return recibidas
  }

  /** Solo para pruebas */
  static vaciar(): void {
    recibidas.length = 0
  }
}
