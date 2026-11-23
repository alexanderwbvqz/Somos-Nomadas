import { describe, expect, it } from 'vitest'
import { datosFormaVacios, LIMITE_SOCIO_IDEAL, limpiarForma, preguntasForma, validarForma, type EntradaForma } from './forma'

const vacia = (): EntradaForma => ({ respuestas: {}, busca: [], socioIdeal: '' })

describe('preguntasForma', () => {
  it('son seis, con ids y opciones sin repetir', () => {
    expect(preguntasForma).toHaveLength(6)
    expect(new Set(preguntasForma.map((pregunta) => pregunta.id)).size).toBe(6)
    for (const pregunta of preguntasForma) expect(new Set(pregunta.opciones).size).toBe(pregunta.opciones.length)
  })
})

describe('validarForma', () => {
  it('todo vacío es válido: es opcional', () => {
    expect(validarForma(vacia())).toEqual({})
    expect(validarForma(datosFormaVacios())).toEqual({})
  })

  it('acepta respuestas posibles, áreas y un texto', () => {
    expect(validarForma({ respuestas: { dedicacion: 'de10a20', riesgo: 'equilibrio' }, busca: ['tecnologia', 'finanzas'], socioIdeal: 'Alguien que escuche' })).toEqual({})
  })

  it('rechaza una respuesta que no es de esa pregunta, o de una pregunta que no existe', () => {
    expect(validarForma({ ...vacia(), respuestas: { dedicacion: 'remota' } })).toEqual({ respuestas: 'respuestaInvalida' })
    expect(validarForma({ ...vacia(), respuestas: { colorFavorito: 'rojo' } })).toEqual({ respuestas: 'respuestaInvalida' })
  })

  it('rechaza un área que no existe o repetida', () => {
    expect(validarForma({ ...vacia(), busca: ['tecnologia', 'magia'] })).toEqual({ busca: 'areaInvalida' })
    expect(validarForma({ ...vacia(), busca: ['finanzas', 'finanzas'] })).toEqual({ busca: 'areaInvalida' })
  })

  it('el texto vale hasta el límite y ni uno más', () => {
    expect(validarForma({ ...vacia(), socioIdeal: 'a'.repeat(LIMITE_SOCIO_IDEAL) })).toEqual({})
    expect(validarForma({ ...vacia(), socioIdeal: 'a'.repeat(LIMITE_SOCIO_IDEAL + 1) })).toEqual({ socioIdeal: 'textoLargo' })
  })
})

describe('limpiarForma', () => {
  it('deja las áreas en el orden de la lista, recorta el texto y conserva solo lo contestado', () => {
    const limpia = limpiarForma({ respuestas: { riesgo: 'seguro', dedicacion: 'masDe20' }, busca: ['operaciones', 'tecnologia'], socioIdeal: '  alguien  ' })
    expect(limpia.busca).toEqual(['tecnologia', 'operaciones'])
    expect(limpia.socioIdeal).toBe('alguien')
    expect(limpia.respuestas).toEqual({ dedicacion: 'masDe20', riesgo: 'seguro' })
  })
})
