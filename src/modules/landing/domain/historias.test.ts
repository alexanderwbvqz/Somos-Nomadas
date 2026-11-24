import { describe, expect, it } from 'vitest'
import type { Historia } from './Historia'
import { historiaPublicable, historiasPublicables, LIMITES_HISTORIAS } from './historias'

const ANIO = 2026

// Una historia completa: cada prueba cambia solo lo que le importa
function historia(cambios: Partial<Historia> = {}): Historia {
  return {
    clave: 'apple',
    nombre: 'Apple',
    anio: 1976,
    areaFondo: 'marketing',
    combinacion: 'Ingeniería + Ventas',
    frase: { inicio: 'Uno construía los computadores. El otro vio cómo', resaltado: 'llevarlos a la gente', fin: '.' },
    personas: [
      { iniciales: 'SJ', nombre: 'Steve Jobs', area: 'marketing', aporte: 'Producto y ventas' },
      { iniciales: 'SW', nombre: 'Steve Wozniak', area: 'tecnologia', aporte: 'Ingeniería' },
    ],
    parrafos: ['Se conocieron en 1971.'],
    fuente: { texto: 'Wikipedia: Steve Wozniak', href: 'https://en.wikipedia.org/wiki/Steve_Wozniak' },
    ...cambios,
  }
}

describe('historiaPublicable', () => {
  it('una historia completa se puede publicar', () => {
    expect(historiaPublicable(historia(), ANIO)).toBe(true)
  })

  it('sin fuente no se publica: lo que no se puede comprobar no sale', () => {
    expect(historiaPublicable(historia({ fuente: { texto: '', href: 'https://en.wikipedia.org/wiki/Steve_Wozniak' } }), ANIO)).toBe(false)
    expect(historiaPublicable(historia({ fuente: { texto: 'Wikipedia', href: '' } }), ANIO)).toBe(false)
  })

  it('el enlace de la fuente tiene que ser seguro: https, sin usuario y hacia un sitio con nombre', () => {
    for (const href of ['http://example.com/a', 'https://banco.com@otro.com/', 'https://192.168.0.1/', 'javascript:alert(1)', 'no es un enlace']) {
      expect(historiaPublicable(historia({ fuente: { texto: 'Fuente', href } }), ANIO)).toBe(false)
    }
  })

  it('necesita entre dos y tres personas', () => {
    expect(LIMITES_HISTORIAS.personas).toEqual({ min: 2, max: 3 })
    const personas = historia().personas
    expect(historiaPublicable(historia({ personas: personas.slice(0, 1) }), ANIO)).toBe(false)
    expect(historiaPublicable(historia({ personas: [...personas, { iniciales: 'RW', nombre: 'Ronald Wayne', area: 'operaciones', aporte: 'Operaciones' }] }), ANIO)).toBe(true)
    expect(historiaPublicable(historia({ personas: [...personas, ...personas] }), ANIO)).toBe(false)
  })

  it('cada persona lleva iniciales (de una a tres letras), nombre y aporte', () => {
    const [a, b] = historia().personas
    expect(historiaPublicable(historia({ personas: [{ ...a!, iniciales: '' }, b!] }), ANIO)).toBe(false)
    expect(historiaPublicable(historia({ personas: [{ ...a!, iniciales: 'ABCD' }, b!] }), ANIO)).toBe(false)
    expect(historiaPublicable(historia({ personas: [{ ...a!, nombre: '  ' }, b!] }), ANIO)).toBe(false)
    expect(historiaPublicable(historia({ personas: [{ ...a!, aporte: '' }, b!] }), ANIO)).toBe(false)
  })

  it('el año es un entero razonable y no es del futuro', () => {
    expect(historiaPublicable(historia({ anio: 1799 }), ANIO)).toBe(false)
    expect(historiaPublicable(historia({ anio: ANIO + 1 }), ANIO)).toBe(false)
    expect(historiaPublicable(historia({ anio: 1976.5 }), ANIO)).toBe(false)
    expect(historiaPublicable(historia({ anio: ANIO }), ANIO)).toBe(true)
  })

  it('necesita una frase con su parte resaltada y al menos un párrafo con texto', () => {
    expect(historiaPublicable(historia({ frase: { inicio: 'Hola', resaltado: ' ', fin: '' } }), ANIO)).toBe(false)
    expect(historiaPublicable(historia({ parrafos: [] }), ANIO)).toBe(false)
    expect(historiaPublicable(historia({ parrafos: ['  '] }), ANIO)).toBe(false)
  })

  it('necesita clave, nombre y combinación', () => {
    expect(historiaPublicable(historia({ clave: '' }), ANIO)).toBe(false)
    expect(historiaPublicable(historia({ nombre: ' ' }), ANIO)).toBe(false)
    expect(historiaPublicable(historia({ combinacion: '' }), ANIO)).toBe(false)
  })
})

describe('historiasPublicables', () => {
  it('deja fuera las que no se pueden publicar y conserva el orden', () => {
    const lista = [historia({ clave: 'a' }), historia({ clave: 'b', parrafos: [] }), historia({ clave: 'c' })]
    expect(historiasPublicables(lista, ANIO).map((h) => h.clave)).toEqual(['a', 'c'])
  })

  it('si dos historias tienen la misma clave, se queda la primera', () => {
    const lista = [historia({ clave: 'a', nombre: 'Primera' }), historia({ clave: 'a', nombre: 'Segunda' })]
    expect(historiasPublicables(lista, ANIO).map((h) => h.nombre)).toEqual(['Primera'])
  })

  it('sin historias, no hay ninguna', () => {
    expect(historiasPublicables([], ANIO)).toEqual([])
  })
})
