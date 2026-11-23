import { describe, expect, it } from 'vitest'
import { hayErroresSobreMi, LIMITE_SOBRE_MI, limpiarSobreMi, validarSobreMi } from './sobreMi'

describe('validarSobreMi', () => {
  it('acepta un texto normal y también el vacío (es opcional)', () => {
    expect(validarSobreMi('Programo desde hace cuatro años.')).toEqual({})
    expect(validarSobreMi('')).toEqual({})
  })

  it('acepta justo el máximo y rechaza uno más', () => {
    expect(validarSobreMi('a'.repeat(LIMITE_SOBRE_MI))).toEqual({})
    expect(validarSobreMi('a'.repeat(LIMITE_SOBRE_MI + 1))).toEqual({ texto: 'textoLargo' })
  })

  it('los espacios de los extremos no cuentan para el máximo', () => {
    expect(validarSobreMi(`   ${'a'.repeat(LIMITE_SOBRE_MI)}   `)).toEqual({})
  })
})

describe('limpiarSobreMi', () => {
  it('quita los espacios de los extremos y conserva los saltos de línea del medio', () => {
    expect(limpiarSobreMi('  Hola.\n\nSoy Ana.  ')).toBe('Hola.\n\nSoy Ana.')
  })

  it('deja los saltos de línea de Windows como `\\n`', () => {
    expect(limpiarSobreMi('Hola.\r\nSoy Ana.')).toBe('Hola.\nSoy Ana.')
  })

  it('un texto de solo espacios queda vacío', () => {
    expect(limpiarSobreMi('   \n  ')).toBe('')
  })
})

describe('hayErroresSobreMi', () => {
  it('dice si hay algún error', () => {
    expect(hayErroresSobreMi({})).toBe(false)
    expect(hayErroresSobreMi({ texto: 'textoLargo' })).toBe(true)
  })
})
