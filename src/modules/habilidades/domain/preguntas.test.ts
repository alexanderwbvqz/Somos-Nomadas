import { describe, expect, it } from 'vitest'
import { habilidades } from './catalogo'
import { tiemposPractica } from './puntos'
import { esRespuestaValida, ID_TIEMPO, LIMITE_TEXTO, preguntasDe, tiempoDeRespuestas, tienePreguntasPropias, type Pregunta } from './preguntas'

const buscar = (habilidad: Parameters<typeof preguntasDe>[0], id: string): Pregunta => {
  const pregunta = preguntasDe(habilidad).find((candidata) => candidata.id === id)
  if (!pregunta) throw new Error(`falta la pregunta ${id}`)
  return pregunta
}

describe('preguntasDe', () => {
  it('toda habilidad tiene preguntas, con la del tiempo y la del texto', () => {
    for (const habilidad of habilidades) {
      const ids = preguntasDe(habilidad).map((pregunta) => pregunta.id)
      expect(ids).toContain(ID_TIEMPO)
      expect(ids).toContain('texto')
    }
  })

  it('dentro de una habilidad los ids de las preguntas no se repiten y las opciones tampoco', () => {
    for (const habilidad of habilidades) {
      const preguntas = preguntasDe(habilidad)
      expect(new Set(preguntas.map((pregunta) => pregunta.id)).size).toBe(preguntas.length)
      for (const pregunta of preguntas) {
        if (pregunta.tipo !== 'texto') expect(new Set(pregunta.opciones).size).toBe(pregunta.opciones.length)
      }
    }
  })

  it('la pregunta del tiempo ofrece exactamente los tiempos de práctica', () => {
    const tiempo = buscar('ventas', ID_TIEMPO)
    expect(tiempo.tipo === 'una' && tiempo.opciones).toEqual([...tiemposPractica])
  })

  it('el texto es la última pregunta', () => {
    for (const habilidad of habilidades) expect(preguntasDe(habilidad).at(-1)?.id).toBe('texto')
  })

  it('cuatro habilidades tienen preguntas propias y las demás las genéricas', () => {
    expect(habilidades.filter(tienePreguntasPropias).sort()).toEqual(['desarrolloWeb', 'inteligenciaArtificial', 'marketingDigital', 'ventas'])
    expect(preguntasDe('ciberseguridad').map((pregunta) => pregunta.id)).toEqual(['quien', 'tiempo', 'texto'])
    expect(preguntasDe('desarrolloWeb').map((pregunta) => pregunta.id)).toContain('tecnologias')
  })
})

describe('esRespuestaValida', () => {
  it('una pregunta de elegir una acepta una de sus opciones y nada más', () => {
    const parte = buscar('desarrolloWeb', 'parte')
    expect(esRespuestaValida(parte, 'ambas')).toBe(true)
    expect(esRespuestaValida(parte, 'otraCosa')).toBe(false)
    expect(esRespuestaValida(parte, ['ambas'])).toBe(false)
    expect(esRespuestaValida(parte, undefined)).toBe(false)
  })

  it('una de elegir varias acepta una lista de sus opciones, también vacía, sin repetir', () => {
    const tecnologias = buscar('desarrolloWeb', 'tecnologias')
    expect(esRespuestaValida(tecnologias, ['react', 'node'])).toBe(true)
    expect(esRespuestaValida(tecnologias, [])).toBe(true)
    expect(esRespuestaValida(tecnologias, ['react', 'react'])).toBe(false)
    expect(esRespuestaValida(tecnologias, ['react', 'cobol'])).toBe(false)
    expect(esRespuestaValida(tecnologias, 'react')).toBe(false)
    expect(esRespuestaValida(tecnologias, [3])).toBe(false)
  })

  it('un texto vale hasta el límite y ni uno más', () => {
    const texto = buscar('ventas', 'texto')
    expect(esRespuestaValida(texto, 'Cerré un contrato')).toBe(true)
    expect(esRespuestaValida(texto, '')).toBe(true)
    expect(esRespuestaValida(texto, 'a'.repeat(LIMITE_TEXTO))).toBe(true)
    expect(esRespuestaValida(texto, 'a'.repeat(LIMITE_TEXTO + 1))).toBe(false)
    expect(esRespuestaValida(texto, 5)).toBe(false)
  })
})

describe('tiempoDeRespuestas', () => {
  it('devuelve el tiempo contestado', () => {
    expect(tiempoDeRespuestas({ tiempo: 'unoATresAnos', texto: 'x' })).toBe('unoATresAnos')
  })

  it('sin contestar, o con algo que no es un tiempo, no hay tiempo', () => {
    expect(tiempoDeRespuestas({})).toBeUndefined()
    expect(tiempoDeRespuestas({ tiempo: 'mucho' })).toBeUndefined()
    expect(tiempoDeRespuestas({ tiempo: ['unoATresAnos'] })).toBeUndefined()
  })
})
