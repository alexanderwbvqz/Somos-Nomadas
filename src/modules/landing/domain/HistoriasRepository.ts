import type { Historia } from './Historia'

export interface HistoriasRepository {
  /**
   * Las historias conocidas, con los textos en el idioma pedido (`es`, `en` o `pt`). Pueden llegar incompletas: quien las usa
   * decide cuáles se pueden publicar con las reglas del dominio. Si no hay texto en ese idioma, el adaptador devuelve el español.
   */
  obtener(idioma: string): Promise<Historia[]>
}
