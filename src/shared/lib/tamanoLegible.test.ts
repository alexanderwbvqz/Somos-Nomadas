import { describe, expect, it } from 'vitest'
import { tamanoLegible } from './tamanoLegible'

describe('tamanoLegible', () => {
  it('usa bytes, KB o MB según el tamaño', () => {
    expect(tamanoLegible(800)).toBe('800 B')
    expect(tamanoLegible(230 * 1024)).toBe('230 KB')
    expect(tamanoLegible(1.2 * 1024 * 1024)).toBe('1.2 MB')
  })

  it('en el límite de cada unidad pasa a la siguiente', () => {
    expect(tamanoLegible(1023)).toBe('1023 B')
    expect(tamanoLegible(1024)).toBe('1 KB')
    expect(tamanoLegible(1024 * 1024)).toBe('1.0 MB')
  })
})
