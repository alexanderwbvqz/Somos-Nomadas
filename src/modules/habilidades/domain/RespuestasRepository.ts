import type { HabilidadId } from './catalogo'
import type { DatosForma } from './forma'
import type { DatosHistorias } from './historias'
import type { Marcas } from './perfilArea'
import type { RespuestasProfundizacion } from './preguntas'
import type { RespuestasGuardadas } from './respuestas'

export interface RespuestasRepository {
  /**
   * Guardan lo que la persona contó en cada paso, de quien tiene la sesión abierta. Cuando exista la sesión real, este
   * puerto recibirá también de quién es; mientras tanto el adaptador simulado guarda un único conjunto de respuestas.
   * Cada guardado sustituye lo anterior de ese paso.
   */
  guardarMarcas(marcas: Marcas): Promise<void>
  guardarProfundizacion(habilidad: HabilidadId, respuestas: RespuestasProfundizacion): Promise<void>
  guardarHistorias(historias: DatosHistorias): Promise<void>
  guardarForma(forma: DatosForma): Promise<void>
  /** Todo lo guardado hasta ahora; lo que falta, vacío */
  obtener(): Promise<RespuestasGuardadas>
}
