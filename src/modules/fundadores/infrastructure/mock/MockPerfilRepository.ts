import type { PerfilRepository } from '../../domain/PerfilRepository'
import type { PerfilBienvenida } from '../../domain/perfil'

// simulado: no hay base de datos ni sesión. Recuerda el último perfil en memoria mientras el servidor está
// encendido. Se sustituye por el adaptador real con el backend, cuando se sepa de quién es cada perfil.
// Se guarda en globalThis por la misma razón que las cuentas simuladas de acceso.
const global = globalThis as typeof globalThis & { __perfilSimulado?: { actual?: PerfilBienvenida } }
const memoria = (global.__perfilSimulado ??= {})

export class MockPerfilRepository implements PerfilRepository {
  async guardarBienvenida(perfil: PerfilBienvenida): Promise<void> {
    memoria.actual = perfil
  }

  /** Solo para pruebas */
  static guardado(): PerfilBienvenida | undefined {
    return memoria.actual
  }

  /** Solo para pruebas */
  static vaciar(): void {
    memoria.actual = undefined
  }
}
