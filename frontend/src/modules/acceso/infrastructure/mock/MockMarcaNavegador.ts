import { randomBytes } from 'node:crypto'
import type { MarcaDelNavegador } from '../../domain/confirmacion'

// simulado: la marca de un navegador en memoria, para las pruebas. La real es una cookie `httpOnly`.
export class MockMarcaNavegador implements MarcaDelNavegador {
  valor: string | undefined

  constructor(inicial?: string) {
    this.valor = inicial
  }

  async crear(): Promise<string> {
    this.valor = randomBytes(32).toString('base64url')
    return this.valor
  }

  async leer(): Promise<string | undefined> {
    return this.valor
  }

  async borrar(): Promise<void> {
    this.valor = undefined
  }
}
