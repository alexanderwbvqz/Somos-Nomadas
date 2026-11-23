import { describe, expect, it } from 'vitest'
import { areaDe, areas, esArea, esHabilidad, grupos, habilidades, habilidadesPorGrupo } from './catalogo'

describe('catálogo', () => {
  it('tiene 30 habilidades, sin repetir', () => {
    expect(habilidades).toHaveLength(30)
    expect(new Set(habilidades).size).toBe(30)
  })

  it('cada habilidad está en un grupo, y en uno solo', () => {
    const enGrupos = grupos.flatMap((grupo) => [...habilidadesPorGrupo[grupo]])
    expect(enGrupos).toHaveLength(habilidades.length)
    expect([...enGrupos].sort()).toEqual([...habilidades].sort())
  })

  it('todos los grupos tienen habilidades', () => {
    for (const grupo of grupos) expect(habilidadesPorGrupo[grupo].length).toBeGreaterThan(0)
  })

  it('cada habilidad suma a una de las cuatro áreas, y las cuatro áreas tienen al menos una', () => {
    for (const habilidad of habilidades) expect(areas).toContain(areaDe[habilidad])
    for (const area of areas) expect(habilidades.some((habilidad) => areaDe[habilidad] === area)).toBe(true)
  })

  it('hay exactamente cuatro áreas', () => {
    expect([...areas]).toEqual(['tecnologia', 'ventasMarketing', 'finanzas', 'operaciones'])
  })

  it('los grupos no tienen el nombre de ningún área (la persona no debe poder deducirlas)', () => {
    for (const grupo of grupos) expect((areas as readonly string[]).includes(grupo)).toBe(false)
  })

  it('reconoce las habilidades y las áreas, y rechaza lo demás', () => {
    expect(esHabilidad('ventas')).toBe(true)
    expect(esHabilidad('tecnologia')).toBe(false)
    expect(esHabilidad(5)).toBe(false)
    expect(esArea('finanzas')).toBe(true)
    expect(esArea('ventas')).toBe(false)
    expect(esArea(undefined)).toBe(false)
  })
})
