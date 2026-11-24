import { describe, expect, it } from 'vitest'
import { calcularPerfil, respuestasVacias, tiemposDe, validarProfundizacion, type RespuestasGuardadas } from './respuestas'

describe('validarProfundizacion', () => {
  it('acepta respuestas posibles de esa habilidad', () => {
    expect(validarProfundizacion('desarrolloWeb', { tecnologias: ['react', 'node'], parte: 'ambas', tiempo: 'unoATresAnos', texto: 'Hice una tienda' })).toEqual({})
  })

  it('sin respuestas es válido: se pueden dejar en blanco', () => {
    expect(validarProfundizacion('ventas', {})).toEqual({})
  })

  it('señala la pregunta que no es de esa habilidad', () => {
    // «tecnologias» es de desarrollo web, no de ventas
    expect(validarProfundizacion('ventas', { tecnologias: ['react'] })).toEqual({ tecnologias: 'preguntaDesconocida' })
  })

  it('señala la respuesta que no es posible y deja pasar las buenas', () => {
    expect(validarProfundizacion('ventas', { aQuien: 'marcianos', tiempo: 'masDeCincoAnos' })).toEqual({ aQuien: 'respuestaInvalida' })
  })

  it('usa las preguntas genéricas en una habilidad sin preguntas propias', () => {
    expect(validarProfundizacion('ciberseguridad', { quien: ['empresa'], tiempo: 'menosDeUnAno' })).toEqual({})
    expect(validarProfundizacion('ciberseguridad', { tecnologias: ['react'] })).toEqual({ tecnologias: 'preguntaDesconocida' })
  })
})

function conTodo(): RespuestasGuardadas {
  return {
    marcas: { desarrolloWeb: 'esMiTrabajo', ventas: 'variasVeces', marketingDigital: 'variasVeces', finanzasContabilidad: 'unaVez' },
    profundizacion: {
      desarrolloWeb: { tiempo: 'masDeCincoAnos' },
      ventas: { tiempo: 'unoATresAnos' },
      finanzasContabilidad: { tiempo: 'masDeCincoAnos' },
    },
  }
}

describe('tiemposDe', () => {
  it('toma el tiempo de las tres habilidades más fuertes', () => {
    expect(tiemposDe(conTodo())).toEqual({ desarrolloWeb: 'masDeCincoAnos', ventas: 'unoATresAnos' })
  })

  it('ignora lo contado de una habilidad que ya no es de las más fuertes', () => {
    // finanzasContabilidad es la cuarta (una vez): su tiempo guardado no cuenta
    expect(tiemposDe(conTodo()).finanzasContabilidad).toBeUndefined()
  })

  it('una habilidad fuerte sin tiempo contestado no aparece', () => {
    expect(tiemposDe(conTodo()).marketingDigital).toBeUndefined()
  })

  it('sin respuestas no hay tiempos', () => {
    expect(tiemposDe(respuestasVacias())).toEqual({})
  })
})

describe('calcularPerfil', () => {
  it('saca las habilidades con puntos y el área', () => {
    const perfil = calcularPerfil(conTodo())
    // Con las mismas veces hechas, el orden es el del catálogo: marketing digital antes que ventas
    expect(perfil.habilidades.map((h) => h.habilidad)).toEqual(['desarrolloWeb', 'marketingDigital', 'ventas', 'finanzasContabilidad'])
    expect(perfil.habilidades[0]).toMatchObject({ puntos: 5, estimado: false })
    expect(perfil.habilidades[1]).toMatchObject({ habilidad: 'marketingDigital', puntos: 2, estimado: true })
    expect(perfil.habilidades[2]).toMatchObject({ habilidad: 'ventas', puntos: 3, estimado: false })
    // Tecnología (5) y Ventas y Marketing (2 + 3) empatan, y entre las tres más fuertes también: se muestran las dos
    expect(perfil.area).toMatchObject({ areas: ['tecnologia', 'ventasMarketing'], mixto: true })
  })

  it('sin tareas marcadas no hay área', () => {
    expect(calcularPerfil(respuestasVacias())).toEqual({ habilidades: [], area: undefined })
  })
})
