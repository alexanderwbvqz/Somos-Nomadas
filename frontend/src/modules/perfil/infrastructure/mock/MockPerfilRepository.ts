import type { Perfil } from '../../domain/perfil'
import type { PerfilRepository } from '../../domain/PerfilRepository'
import type { EntradaTrayectoria } from '../../domain/trayectoria'
import { perfilDeEjemplo } from './perfilDeEjemplo'

// simulado: no hay base de datos ni sesión. Parte de un perfil de ejemplo y recuerda en memoria lo que la persona escribe
// mientras el servidor está encendido; es el de un único usuario. No refleja lo que se contestó en los pasos del recorrido.
// Se sustituye por el adaptador real con el backend, cuando se sepa de quién es cada perfil.
// Se guarda en globalThis por la misma razón que las cuentas y las respuestas simuladas.
const global = globalThis as typeof globalThis & { __perfilSimulado?: { actual: Perfil } }
const memoria = (global.__perfilSimulado ??= { actual: perfilDeEjemplo() })

export class MockPerfilRepository implements PerfilRepository {
  async obtener(): Promise<Perfil> {
    // Una copia: quien lo lea no debe poder cambiar lo guardado
    return structuredClone(memoria.actual)
  }

  async guardarSobreMi(texto: string): Promise<void> {
    memoria.actual = { ...memoria.actual, sobreMi: texto }
  }

  async guardarTrayectoria(entradas: EntradaTrayectoria[]): Promise<void> {
    memoria.actual = { ...memoria.actual, trayectoria: structuredClone(entradas) }
  }

  async guardarEvidencia(enlaces: string[]): Promise<void> {
    memoria.actual = { ...memoria.actual, evidencia: [...enlaces] }
  }

  /** Solo para pruebas */
  static restablecer(): void {
    memoria.actual = perfilDeEjemplo()
  }
}
