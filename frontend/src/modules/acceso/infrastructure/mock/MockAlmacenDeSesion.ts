import type { AlmacenDeSesion, CredencialDeSesion, SesionGuardada } from '../../domain/sesion'

// simulado: guarda la sesión en memoria, para las pruebas. El real guarda cookies `httpOnly`.
export class MockAlmacenDeSesion implements AlmacenDeSesion {
  guardada: SesionGuardada
  /** Cuántas veces se guardó, para comprobar que no se guarda sin motivo */
  guardados = 0

  constructor(inicial: SesionGuardada = {}) {
    this.guardada = inicial
  }

  async leer(): Promise<SesionGuardada> {
    return { ...this.guardada }
  }

  async guardar(credencial: CredencialDeSesion): Promise<void> {
    this.guardados += 1
    this.guardada = { acceso: credencial.acceso, renovacion: credencial.renovacion }
  }

  async borrar(): Promise<void> {
    this.guardada = {}
  }
}
