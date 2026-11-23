import { beforeEach, describe, expect, it } from 'vitest'
import type { PerfilRepository } from '../domain/PerfilRepository'
import { MockPerfilRepository } from '../infrastructure/mock/MockPerfilRepository'
import { guardarBienvenida } from './guardarBienvenida'
import { obtenerPerfil } from './obtenerPerfil'

describe('obtenerPerfil', () => {
  beforeEach(() => MockPerfilRepository.vaciar())

  it('devuelve lo guardado en la bienvenida', async () => {
    const repositorio = new MockPerfilRepository()
    await guardarBienvenida(repositorio, { nombre: 'Ana', apellidos: 'Torres', pais: 'PE', ciudad: '', busca: ['explorando'] })
    expect(await obtenerPerfil(repositorio)).toMatchObject({ nombre: 'Ana', apellidos: 'Torres', pais: 'PE' })
  })

  it('sin nada guardado devuelve undefined', async () => {
    expect(await obtenerPerfil(new MockPerfilRepository())).toBeUndefined()
  })

  it('si el repositorio falla devuelve undefined en vez de romper', async () => {
    const roto: PerfilRepository = {
      guardarBienvenida: async () => {},
      obtenerBienvenida: async () => { throw new Error('x') },
    }
    expect(await obtenerPerfil(roto)).toBeUndefined()
  })
})
