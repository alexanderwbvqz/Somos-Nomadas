import { describe, expect, it } from 'vitest'
import type { Aliado } from '../domain/Aliado'
import { listarAliados } from './listarAliados'

describe('listarAliados', () => {
  it('devuelve los aliados del repositorio, en su orden', async () => {
    const base = { descripcion: '', descripcionLarga: [], datosClave: [], areas: [], apoyos: [], redes: [] }
    const aliados: Aliado[] = [
      { id: 'b', nombre: 'B', tipo: 'mentores', ...base },
      { id: 'a', nombre: 'A', tipo: 'organizadores', ...base },
    ]
    const resultado = await listarAliados({ listarAliados: async () => aliados })
    expect(resultado.map((aliado) => aliado.id)).toEqual(['b', 'a'])
  })

  it('con un repositorio vacío devuelve una lista vacía', async () => {
    expect(await listarAliados({ listarAliados: async () => [] })).toEqual([])
  })
})
