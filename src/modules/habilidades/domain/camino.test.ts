import { describe, expect, it } from 'vitest'
import { caminoPorDefecto, caminos, caminosDisponibles } from './camino'

describe('caminos de inicio', () => {
  it('hay dos: con lo escrito y desde cero', () => {
    expect([...caminos]).toEqual(['escritas', 'cero'])
  })

  it('sin análisis solo se puede arrancar de cero', () => {
    expect(caminosDisponibles({ analisisDisponible: false })).toEqual(['cero'])
  })

  it('con análisis se pueden elegir los dos', () => {
    expect(caminosDisponibles({ analisisDisponible: true })).toEqual(['escritas', 'cero'])
  })

  it('el camino que arranca marcado está disponible en los dos casos', () => {
    expect(caminosDisponibles({ analisisDisponible: false })).toContain(caminoPorDefecto)
    expect(caminosDisponibles({ analisisDisponible: true })).toContain(caminoPorDefecto)
  })
})
