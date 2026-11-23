import { describe, expect, it } from 'vitest'
import { leerForma, leerHistorias, leerMarcas, leerProfundizacion } from './respuestasSchema'

describe('leerMarcas', () => {
  it('lee tareas y veces conocidas, también ninguna', () => {
    expect(leerMarcas({ marcas: { ventas: 'unaVez', desarrolloWeb: 'esMiTrabajo' } })).toEqual({ ventas: 'unaVez', desarrolloWeb: 'esMiTrabajo' })
    expect(leerMarcas({ marcas: {} })).toEqual({})
  })

  it('rechaza una habilidad o una frecuencia desconocida, o una forma distinta', () => {
    expect(leerMarcas({ marcas: { astrologia: 'unaVez' } })).toBeUndefined()
    expect(leerMarcas({ marcas: { ventas: 'siempre' } })).toBeUndefined()
    expect(leerMarcas({ ventas: 'unaVez' })).toBeUndefined()
    expect(leerMarcas(undefined)).toBeUndefined()
    expect(leerMarcas({ marcas: [] })).toBeUndefined()
  })
})

describe('leerProfundizacion', () => {
  it('lee la habilidad y sus respuestas, de texto o de lista', () => {
    expect(leerProfundizacion({ habilidad: 'ventas', respuestas: { aQuien: 'empresas', canal: ['llamadas'], texto: 'x' } })).toEqual({
      habilidad: 'ventas',
      respuestas: { aQuien: 'empresas', canal: ['llamadas'], texto: 'x' },
    })
  })

  it('rechaza una habilidad desconocida, respuestas de otro tipo y demasiadas preguntas', () => {
    expect(leerProfundizacion({ habilidad: 'astrologia', respuestas: {} })).toBeUndefined()
    expect(leerProfundizacion({ habilidad: 'ventas', respuestas: { aQuien: 5 } })).toBeUndefined()
    expect(leerProfundizacion({ habilidad: 'ventas', respuestas: { canal: [1] } })).toBeUndefined()
    const muchas = Object.fromEntries(Array.from({ length: 21 }, (_, i) => [`p${i}`, 'x']))
    expect(leerProfundizacion({ habilidad: 'ventas', respuestas: muchas })).toBeUndefined()
  })

  it('rechaza un texto enorme', () => {
    expect(leerProfundizacion({ habilidad: 'ventas', respuestas: { texto: 'a'.repeat(5000) } })).toBeUndefined()
  })
})

const historias = { logro: 'a', problemaDificil: '', problemaMundo: '', sectores: ['salud'], aceptaAnalisis: true }

describe('leerHistorias', () => {
  it('lee la forma correcta, sin comprobar aún si los sectores existen (eso es del dominio)', () => {
    expect(leerHistorias(historias)).toEqual(historias)
    expect(leerHistorias({ ...historias, sectores: ['astrologia'] })?.sectores).toEqual(['astrologia'])
  })

  it('rechaza tipos erróneos, textos enormes y demasiados sectores', () => {
    expect(leerHistorias({ ...historias, aceptaAnalisis: 'si' })).toBeUndefined()
    expect(leerHistorias({ ...historias, logro: 5 })).toBeUndefined()
    expect(leerHistorias({ ...historias, logro: 'a'.repeat(10000) })).toBeUndefined()
    expect(leerHistorias({ ...historias, sectores: Array.from({ length: 31 }, () => 'salud') })).toBeUndefined()
    expect(leerHistorias(null)).toBeUndefined()
  })
})

const forma = { respuestas: { dedicacion: 'de10a20' }, busca: ['finanzas'], socioIdeal: 'x' }

describe('leerForma', () => {
  it('lee la forma correcta', () => {
    expect(leerForma(forma)).toEqual(forma)
  })

  it('rechaza tipos erróneos, un texto enorme y demasiadas respuestas', () => {
    expect(leerForma({ ...forma, respuestas: { dedicacion: 5 } })).toBeUndefined()
    expect(leerForma({ ...forma, socioIdeal: 'a'.repeat(10000) })).toBeUndefined()
    expect(leerForma({ ...forma, respuestas: Object.fromEntries(Array.from({ length: 13 }, (_, i) => [`p${i}`, 'x'])) })).toBeUndefined()
    expect(leerForma({ ...forma, busca: 'finanzas' })).toBeUndefined()
  })
})
