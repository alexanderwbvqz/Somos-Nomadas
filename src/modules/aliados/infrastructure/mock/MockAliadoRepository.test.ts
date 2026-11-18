import { describe, expect, it } from 'vitest'
import { contarPorTipo } from '../../domain/aliados'
import { MockAliadoRepository } from './MockAliadoRepository'

describe('MockAliadoRepository', () => {
  it('tiene aliados de los tres tipos, cuatro de cada uno', async () => {
    const aliados = await new MockAliadoRepository().listarAliados()
    expect(aliados).toHaveLength(12)
    expect(contarPorTipo(aliados)).toEqual({ mentores: 4, organizadores: 4, estrategicos: 4 })
  })

  it('los identificadores no se repiten (sirven de enlace a la página de cada aliado)', async () => {
    const ids = (await new MockAliadoRepository().listarAliados()).map((aliado) => aliado.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/)
  })

  it('todos llevan nombre y una descripción de entre 20 y 40 palabras (la extensión esperada de las reales)', async () => {
    for (const aliado of await new MockAliadoRepository().listarAliados()) {
      const palabras = aliado.descripcion.trim().split(/\s+/).length
      expect(aliado.nombre.length).toBeGreaterThan(0)
      expect(palabras, aliado.nombre).toBeGreaterThanOrEqual(20)
      expect(palabras, aliado.nombre).toBeLessThanOrEqual(40)
    }
  })
})
