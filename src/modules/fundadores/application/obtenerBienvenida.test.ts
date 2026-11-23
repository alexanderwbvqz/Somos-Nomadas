import { beforeEach, describe, expect, it } from 'vitest'
import type { BienvenidaRepository } from '../domain/BienvenidaRepository'
import { MockBienvenidaRepository } from '../infrastructure/mock/MockBienvenidaRepository'
import { guardarBienvenida } from './guardarBienvenida'
import { obtenerBienvenida } from './obtenerBienvenida'

describe('obtenerBienvenida', () => {
  beforeEach(() => MockBienvenidaRepository.vaciar())

  it('devuelve lo guardado en la bienvenida', async () => {
    const repositorio = new MockBienvenidaRepository()
    await guardarBienvenida(repositorio, { nombre: 'Ana', apellidos: 'Torres', pais: 'PE', ciudad: '', busca: ['explorando'] })
    expect(await obtenerBienvenida(repositorio)).toMatchObject({ nombre: 'Ana', apellidos: 'Torres', pais: 'PE' })
  })

  it('sin nada guardado devuelve undefined', async () => {
    expect(await obtenerBienvenida(new MockBienvenidaRepository())).toBeUndefined()
  })

  it('si el repositorio falla devuelve undefined en vez de romper', async () => {
    const roto: BienvenidaRepository = {
      guardarBienvenida: async () => {},
      obtenerBienvenida: async () => { throw new Error('x') },
    }
    expect(await obtenerBienvenida(roto)).toBeUndefined()
  })
})
