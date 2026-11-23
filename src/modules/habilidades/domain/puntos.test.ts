import { describe, expect, it } from 'vitest'
import { esFrecuencia, esTiempoPractica, frecuencias, puntosDe, tiemposPractica } from './puntos'

describe('puntosDe', () => {
  it('sin saber el tiempo, los puntos son 1, 2 o 3 y se marcan como estimados', () => {
    expect(puntosDe('unaVez')).toEqual({ puntos: 1, estimado: true })
    expect(puntosDe('variasVeces')).toEqual({ puntos: 2, estimado: true })
    expect(puntosDe('esMiTrabajo')).toEqual({ puntos: 3, estimado: true })
  })

  it('sin el tiempo nunca pasa de 3', () => {
    for (const frecuencia of frecuencias) expect(puntosDe(frecuencia).puntos).toBeLessThanOrEqual(3)
  })

  it('con el tiempo suma un punto desde un año y dos desde cinco, y deja de ser estimado', () => {
    expect(puntosDe('unaVez', 'menosDeUnAno')).toEqual({ puntos: 1, estimado: false })
    expect(puntosDe('unaVez', 'unoATresAnos')).toEqual({ puntos: 2, estimado: false })
    expect(puntosDe('variasVeces', 'tresACincoAnos')).toEqual({ puntos: 3, estimado: false })
    expect(puntosDe('esMiTrabajo', 'masDeCincoAnos')).toEqual({ puntos: 5, estimado: false })
  })

  it('el máximo es 5 y el mínimo 1, en cualquier combinación', () => {
    for (const frecuencia of frecuencias) {
      for (const tiempo of tiemposPractica) {
        const { puntos } = puntosDe(frecuencia, tiempo)
        expect(puntos).toBeGreaterThanOrEqual(1)
        expect(puntos).toBeLessThanOrEqual(5)
      }
    }
  })

  it('más veces o más tiempo nunca bajan los puntos', () => {
    for (const tiempo of [undefined, ...tiemposPractica]) {
      const puntos = frecuencias.map((frecuencia) => puntosDe(frecuencia, tiempo).puntos)
      expect(puntos).toEqual([...puntos].sort((a, b) => a - b))
    }
    for (const frecuencia of frecuencias) {
      const puntos = tiemposPractica.map((tiempo) => puntosDe(frecuencia, tiempo).puntos)
      expect(puntos).toEqual([...puntos].sort((a, b) => a - b))
    }
  })

  it('reconoce las frecuencias y los tiempos, y rechaza lo demás', () => {
    expect(esFrecuencia('esMiTrabajo')).toBe(true)
    expect(esFrecuencia('siempre')).toBe(false)
    expect(esTiempoPractica('masDeCincoAnos')).toBe(true)
    expect(esTiempoPractica('mucho')).toBe(false)
    expect(esTiempoPractica(3)).toBe(false)
  })
})
