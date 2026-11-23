import { describe, expect, it } from 'vitest'
import { areaDe, areas, esArea, esHabilidad, grupos, habilidades, habilidadesPorGrupo } from './catalogo'

describe('catálogo', () => {
  it('tiene 40 habilidades, sin repetir', () => {
    expect(habilidades).toHaveLength(40)
    expect(new Set(habilidades).size).toBe(40)
  })

  it('cada habilidad está en un grupo, y en uno solo', () => {
    const enGrupos = grupos.flatMap((grupo) => [...habilidadesPorGrupo[grupo]])
    expect(enGrupos).toHaveLength(habilidades.length)
    expect([...enGrupos].sort()).toEqual([...habilidades].sort())
  })

  it('hay diez grupos, de cuatro habilidades cada uno, para que la lista sea pareja', () => {
    expect(grupos).toHaveLength(10)
    for (const grupo of grupos) expect(habilidadesPorGrupo[grupo], grupo).toHaveLength(4)
  })

  it('el orden del catálogo es el de los grupos: así se muestra la lista y así se desempata', () => {
    const enOrdenDeGrupos = grupos.flatMap((grupo) => [...habilidadesPorGrupo[grupo]])
    expect([...habilidades]).toEqual(enOrdenDeGrupos)
  })

  it('cada habilidad suma a una de las cuatro áreas', () => {
    for (const habilidad of habilidades) expect(areas).toContain(areaDe[habilidad])
  })

  it('cada área tiene exactamente diez habilidades: ninguna tiene ventaja por tener más donde acumular puntos', () => {
    for (const area of areas) expect(habilidades.filter((habilidad) => areaDe[habilidad] === area), area).toHaveLength(10)
  })

  it('las reasignaciones acordadas están donde deben', () => {
    expect(areaDe.analisisDatos).toBe('finanzas')
    expect(areaDe.atencionCliente).toBe('operaciones')
    expect(areaDe.validacionIdeas).toBe('ventasMarketing')
    expect(areaDe.investigacionUsuarios).toBe('ventasMarketing')
    expect(areaDe.estrategiaProducto).toBe('operaciones')
    expect(areaDe.disenoGrafico).toBe('ventasMarketing')
    expect(areaDe.disenoInterfaces).toBe('tecnologia')
  })

  it('las diez nuevas son seis de finanzas y cuatro de operaciones', () => {
    const nuevasDeFinanzas = ['controlGastos', 'preciosMargenes', 'facturacionCobranza', 'impuestos', 'creditosSubvenciones', 'nomina'] as const
    const nuevasDeOperaciones = ['comprasProveedores', 'controlCalidad', 'procesos', 'inventario'] as const
    for (const habilidad of nuevasDeFinanzas) expect(areaDe[habilidad], habilidad).toBe('finanzas')
    for (const habilidad of nuevasDeOperaciones) expect(areaDe[habilidad], habilidad).toBe('operaciones')
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
