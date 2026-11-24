import { describe, expect, it } from 'vitest'
import { areaDeEjemplo, areasMatch, conexionesPorArea, totalConexiones } from './match'

describe('reglas del match', () => {
  it.each(areasMatch)('para una persona de %s: 1 de su área y 3 de cada una de las otras', (propia) => {
    const conexiones = conexionesPorArea(propia)
    for (const area of areasMatch) {
      expect(conexiones[area]).toBe(area === propia ? 1 : 3)
    }
  })

  it.each(areasMatch)('para una persona de %s suman 10', (propia) => {
    expect(totalConexiones(propia)).toBe(10)
  })

  it('el ejemplo siempre es de un área distinta de la propia', () => {
    for (const propia of areasMatch) {
      expect(areaDeEjemplo(propia)).not.toBe(propia)
    }
  })
})
