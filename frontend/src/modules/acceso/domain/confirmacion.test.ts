import { describe, expect, it } from 'vitest'
import { esIdiomaDelCorreo, tieneFormaDeToken } from './confirmacion'

describe('tieneFormaDeToken', () => {
  it.each(['a'.repeat(20), 'A'.repeat(200), 'aZ09_-'.repeat(4), 'kVmM4x6ra2TdRrgU23duyfSBxrvhOwiN71QK2GzTuZ8'])(
    'acepta %s',
    (token) => {
      expect(tieneFormaDeToken(token)).toBe(true)
    },
  )

  it.each(['', 'a'.repeat(19), 'a'.repeat(201), 'con espacio aaaaaaaaaaaaaa', 'con/barra/aaaaaaaaaaaaaaaa', 'punto.aaaaaaaaaaaaaaaaaaa', 'a'.repeat(30) + '\n', 'acentuadoáaaaaaaaaaaaaaaa'])(
    'rechaza %j',
    (token) => {
      expect(tieneFormaDeToken(token)).toBe(false)
    },
  )
})

describe('esIdiomaDelCorreo', () => {
  it('acepta los tres idiomas de la web y nada más', () => {
    expect(['es', 'en', 'pt'].every(esIdiomaDelCorreo)).toBe(true)
    for (const valor of ['fr', 'ES', '', undefined, null, 1, ['es']]) expect(esIdiomaDelCorreo(valor)).toBe(false)
  })
})
