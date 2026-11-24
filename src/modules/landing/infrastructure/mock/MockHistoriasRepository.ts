import type { Historia } from '../../domain/Historia'
import type { HistoriasRepository } from '../../domain/HistoriasRepository'
import { historiasDeEjemplo } from './historiasDeEjemplo'

// simulado: no hay base de datos ni gestor de contenidos. Trae las historias de ejemplo (ver historiasDeEjemplo) con los textos
// del idioma pedido, o en español si no hay en ese idioma. Se sustituye por el adaptador real cuando exista dónde guardarlas.
export class MockHistoriasRepository implements HistoriasRepository {
  async obtener(idioma: string): Promise<Historia[]> {
    // Se arma de nuevo en cada llamada: quien las lea no puede cambiar lo que hay
    return historiasDeEjemplo(idioma)
  }
}
