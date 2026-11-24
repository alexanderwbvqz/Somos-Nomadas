import type { HabilidadId } from '../../domain/catalogo'
import type { DatosForma } from '../../domain/forma'
import type { DatosHistorias } from '../../domain/historias'
import type { Marcas } from '../../domain/perfilArea'
import type { RespuestasProfundizacion } from '../../domain/preguntas'
import { respuestasVacias, type RespuestasGuardadas } from '../../domain/respuestas'
import type { RespuestasRepository } from '../../domain/RespuestasRepository'

// simulado: no hay base de datos ni sesión. Recuerda las respuestas en memoria mientras el servidor está encendido, y
// son las de un único usuario. Se sustituye por el adaptador real con el backend, cuando se sepa de quién es cada una.
// Se guarda en globalThis por la misma razón que las cuentas y el perfil simulados.
const global = globalThis as typeof globalThis & { __respuestasSimuladas?: { actuales: RespuestasGuardadas } }
const memoria = (global.__respuestasSimuladas ??= { actuales: respuestasVacias() })

export class MockRespuestasRepository implements RespuestasRepository {
  async guardarMarcas(marcas: Marcas): Promise<void> {
    memoria.actuales = { ...memoria.actuales, marcas }
  }

  async guardarProfundizacion(habilidad: HabilidadId, respuestas: RespuestasProfundizacion): Promise<void> {
    memoria.actuales = { ...memoria.actuales, profundizacion: { ...memoria.actuales.profundizacion, [habilidad]: respuestas } }
  }

  async guardarHistorias(historias: DatosHistorias): Promise<void> {
    memoria.actuales = { ...memoria.actuales, historias }
  }

  async guardarForma(forma: DatosForma): Promise<void> {
    memoria.actuales = { ...memoria.actuales, forma }
  }

  async obtener(): Promise<RespuestasGuardadas> {
    // Una copia: quien lo lea no debe poder cambiar lo guardado
    return structuredClone(memoria.actuales)
  }

  /** Solo para pruebas */
  static vaciar(): void {
    memoria.actuales = respuestasVacias()
  }
}
