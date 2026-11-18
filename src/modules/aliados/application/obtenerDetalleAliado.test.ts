import { describe, expect, it } from 'vitest'
import type { Aliado } from '../domain/Aliado'
import { obtenerDetalleAliado } from './obtenerDetalleAliado'

function aliado(id: string, tipo: Aliado['tipo']): Aliado {
  return { id, nombre: id, tipo, descripcion: '', descripcionLarga: [], datosClave: [], areas: [], apoyos: [], redes: [] }
}

const repositorio = {
  listarAliados: async () => [aliado('a', 'mentores'), aliado('b', 'organizadores'), aliado('c', 'mentores'), aliado('d', 'mentores')],
}

describe('obtenerDetalleAliado', () => {
  it('devuelve el aliado pedido y los otros de su tipo', async () => {
    const detalle = await obtenerDetalleAliado(repositorio, 'a')
    expect(detalle?.aliado.id).toBe('a')
    expect(detalle?.similares.map((s) => s.id)).toEqual(['c', 'd'])
  })

  it('un id que no existe no tiene detalle', async () => {
    expect(await obtenerDetalleAliado(repositorio, 'no-existe')).toBeUndefined()
  })

  it('un aliado sin otros de su tipo tiene la lista de similares vacía', async () => {
    expect((await obtenerDetalleAliado(repositorio, 'b'))?.similares).toEqual([])
  })
})
