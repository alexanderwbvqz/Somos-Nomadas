import { describe, expect, it } from 'vitest'
import { iniciales } from './iniciales'

describe('iniciales', () => {
  it('toma la primera letra de las dos primeras palabras, en mayúsculas', () => {
    expect(iniciales('Ana Torres')).toBe('AT')
    expect(iniciales('  ana   maría torres  ')).toBe('AM')
  })

  it('con una sola palabra, una inicial', () => {
    expect(iniciales('Ana')).toBe('A')
  })

  it('sin nombre, nada', () => {
    expect(iniciales(undefined)).toBe('')
    expect(iniciales('   ')).toBe('')
  })

  it('respeta letras con tilde y que no son de un solo carácter', () => {
    expect(iniciales('élan Ñandú')).toBe('ÉÑ')
    expect(iniciales('𠮷田 太郎')).toBe('𠮷太')
  })
})
