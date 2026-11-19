import type { PostulacionLimpia } from './postulacion'

export interface PostulacionRepository {
  /** Guarda la postulación como pendiente de revisión. Falla (lanza) si no se pudo guardar. */
  enviar(postulacion: PostulacionLimpia): Promise<void>
}
