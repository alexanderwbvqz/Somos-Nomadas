import { describe, expect, it } from 'vitest'
import { rellenarPlantilla } from './rellenarPlantilla'

describe('rellenarPlantilla', () => {
  it('sustituye cada clave por su valor', () => {
    expect(rellenarPlantilla('frente al {a} % de {b}', { a: 35, b: 'nuevas' })).toBe('frente al 35 % de nuevas')
  })

  it('deja intacta la clave sin valor', () => {
    expect(rellenarPlantilla('hola {nombre}', {})).toBe('hola {nombre}')
  })
})
