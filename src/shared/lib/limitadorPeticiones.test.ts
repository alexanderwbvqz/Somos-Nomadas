import { describe, expect, it } from 'vitest'
import { crearLimitador } from './limitadorPeticiones'

describe('crearLimitador', () => {
  it('deja pasar hasta el máximo y bloquea el siguiente', () => {
    const limitador = crearLimitador({ maximo: 3, ventanaMs: 1000 })
    expect([1, 2, 3, 4].map(() => limitador.permitir('a', 0))).toEqual([true, true, true, false])
  })

  it('cada clave tiene su propia cuenta', () => {
    const limitador = crearLimitador({ maximo: 1, ventanaMs: 1000 })
    expect(limitador.permitir('a', 0)).toBe(true)
    expect(limitador.permitir('a', 0)).toBe(false)
    expect(limitador.permitir('b', 0)).toBe(true)
  })

  it('al pasar la ventana vuelve a permitir', () => {
    const limitador = crearLimitador({ maximo: 1, ventanaMs: 1000 })
    expect(limitador.permitir('a', 0)).toBe(true)
    expect(limitador.permitir('a', 999)).toBe(false)
    expect(limitador.permitir('a', 1000)).toBe(true)
  })

  it('un intento bloqueado no alarga el bloqueo', () => {
    const limitador = crearLimitador({ maximo: 1, ventanaMs: 1000 })
    limitador.permitir('a', 0)
    limitador.permitir('a', 500)
    expect(limitador.permitir('a', 1000)).toBe(true)
  })
})
