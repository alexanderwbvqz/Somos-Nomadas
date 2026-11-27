import { describe, expect, it } from 'vitest'
import { esIdiomaDelCorreo, tieneFormaDeMarca, tieneFormaDeToken } from './confirmacion'

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

describe('tieneFormaDeMarca', () => {
  it('la marca del navegador tiene la misma forma que acepta el backend: base64 de URL, de 20 a 200', () => {
    expect(tieneFormaDeMarca('kVmM4x6ra2TdRrgU23duyfSBxrvhOwiN71QK2GzTuZ8')).toBe(true)
    expect(tieneFormaDeMarca('a'.repeat(20))).toBe(true)
    for (const marca of ['', 'a'.repeat(19), 'a'.repeat(201), 'con espacio aaaaaaaaaaaaaa', 'a;b=c-aaaaaaaaaaaaaaaaaa']) {
      expect(tieneFormaDeMarca(marca)).toBe(false)
    }
  })
})

describe('esIdiomaDelCorreo', () => {
  it('acepta los tres idiomas de la web y nada más', () => {
    expect(['es', 'en', 'pt'].every(esIdiomaDelCorreo)).toBe(true)
    for (const valor of ['fr', 'ES', '', undefined, null, 1, ['es']]) expect(esIdiomaDelCorreo(valor)).toBe(false)
  })
})
