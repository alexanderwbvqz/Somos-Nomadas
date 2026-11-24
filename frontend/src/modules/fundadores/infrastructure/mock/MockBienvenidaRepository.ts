import type { BienvenidaRepository } from '../../domain/BienvenidaRepository'
import type { Bienvenida } from '../../domain/bienvenida'

// simulado: no hay base de datos ni sesión. Recuerda el último perfil en memoria mientras el servidor está
// encendido. Se sustituye por el adaptador real con el backend, cuando se sepa de quién es cada perfil.
// Se guarda en globalThis por la misma razón que las cuentas simuladas de acceso.
const global = globalThis as typeof globalThis & { __bienvenidaSimulada?: { actual?: Bienvenida } }
const memoria = (global.__bienvenidaSimulada ??= {})

export class MockBienvenidaRepository implements BienvenidaRepository {
  async guardarBienvenida(perfil: Bienvenida): Promise<void> {
    memoria.actual = perfil
  }

  async obtenerBienvenida(): Promise<Bienvenida | undefined> {
    return memoria.actual
  }

  /** Solo para pruebas */
  static guardado(): Bienvenida | undefined {
    return memoria.actual
  }

  /** Solo para pruebas */
  static vaciar(): void {
    memoria.actual = undefined
  }
}
