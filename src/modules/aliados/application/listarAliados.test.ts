import { describe, expect, it } from 'vitest'
import type { Aliado } from '../domain/Aliado'
import { listarAliados } from './listarAliados'

describe('listarAliados', () => {
  it('devuelve los aliados del repositorio, en su orden', async () => {
    const aliados: Aliado[] = [
      { id: 'b', nombre: 'B', tipo: 'mentores', descripcion: '' },
      { id: 'a', nombre: 'A', tipo: 'organizadores', descripcion: '' },
    ]
    const resultado = await listarAliados({ listarAliados: async () => aliados })
    expect(resultado.map((aliado) => aliado.id)).toEqual(['b', 'a'])
  })

  it('con un repositorio vacío devuelve una lista vacía', async () => {
    expect(await listarAliados({ listarAliados: async () => [] })).toEqual([])
  })
})
