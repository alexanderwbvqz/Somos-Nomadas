import { describe, expect, it } from 'vitest'
import { leerEvidencia, leerSobreMi, leerTrayectoria } from './perfilSchema'

const entrada = { desde: '2020', hasta: '', rol: 'Dev', donde: 'Estudio', que: '' }

describe('leerSobreMi', () => {
  it('lee el texto', () => {
    expect(leerSobreMi({ texto: 'Hola' })).toBe('Hola')
    expect(leerSobreMi({ texto: '' })).toBe('')
  })

  it('descarta lo que no tiene la forma esperada', () => {
    for (const mal of [undefined, null, 'Hola', 5, [], {}, { texto: 5 }, { texto: null }]) expect(leerSobreMi(mal), String(mal)).toBeUndefined()
  })

  it('descarta un texto absurdamente largo, mucho más que lo que el dominio admite', () => {
    expect(leerSobreMi({ texto: 'a'.repeat(601) })).toBe('a'.repeat(601))
    expect(leerSobreMi({ texto: 'a'.repeat(600 * 4 + 1) })).toBeUndefined()
  })
})

describe('leerTrayectoria', () => {
  it('lee la lista de entradas, y una lista vacía', () => {
    expect(leerTrayectoria({ entradas: [entrada] })).toEqual([entrada])
    expect(leerTrayectoria({ entradas: [] })).toEqual([])
  })

  it('descarta lo que no tiene la forma esperada', () => {
    for (const mal of [undefined, [], { entradas: 'x' }, { entradas: [{ ...entrada, desde: 2020 }] }, { entradas: [{ desde: '2020' }] }, { entradas: [null] }]) {
      expect(leerTrayectoria(mal)).toBeUndefined()
    }
  })

  it('deja pasar hasta el doble del máximo para que el dominio avise de «demasiadas»; más que eso se descarta', () => {
    expect(leerTrayectoria({ entradas: Array.from({ length: 10 }, () => entrada) })).toHaveLength(10)
    expect(leerTrayectoria({ entradas: Array.from({ length: 11 }, () => entrada) })).toBeUndefined()
  })

  it('descarta textos absurdamente largos', () => {
    expect(leerTrayectoria({ entradas: [{ ...entrada, rol: 'a'.repeat(80 * 4 + 1) }] })).toBeUndefined()
    expect(leerTrayectoria({ entradas: [{ ...entrada, desde: '1'.repeat(9) }] })).toBeUndefined()
  })

  it('ignora los campos que sobran', () => {
    expect(leerTrayectoria({ entradas: [{ ...entrada, admin: true }] })).toEqual([entrada])
  })
})

describe('leerEvidencia', () => {
  it('lee la lista de enlaces', () => {
    expect(leerEvidencia({ enlaces: ['https://a.example'] })).toEqual(['https://a.example'])
    expect(leerEvidencia({ enlaces: [] })).toEqual([])
  })

  it('descarta lo que no tiene la forma esperada', () => {
    for (const mal of [undefined, 'https://a.example', { enlaces: 'https://a.example' }, { enlaces: [5] }, { enlaces: [null] }]) {
      expect(leerEvidencia(mal)).toBeUndefined()
    }
  })

  it('deja pasar hasta el doble del máximo de enlaces y de largo, y descarta más que eso', () => {
    expect(leerEvidencia({ enlaces: Array.from({ length: 10 }, (_, i) => `https://a.example/${i}`) })).toHaveLength(10)
    expect(leerEvidencia({ enlaces: Array.from({ length: 11 }, (_, i) => `https://a.example/${i}`) })).toBeUndefined()
    expect(leerEvidencia({ enlaces: [`https://a.example/${'x'.repeat(600)}`] })).toBeUndefined()
  })
})
