import { describe, expect, it } from 'vitest'
import { caminoPorDefecto, caminos, estaDisponible } from './camino'

describe('caminos de inicio', () => {
  it('hay dos: con lo escrito y desde cero', () => {
    expect([...caminos]).toEqual(['escritas', 'cero'])
  })

  it('por ahora solo se puede arrancar de cero', () => {
    expect(estaDisponible('cero')).toBe(true)
    expect(estaDisponible('escritas')).toBe(false)
  })

  it('el camino que arranca marcado está disponible', () => {
    expect(estaDisponible(caminoPorDefecto)).toBe(true)
  })
})
