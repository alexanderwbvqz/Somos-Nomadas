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
    fuentes: [{ texto: 'Computer History Museum', href: 'https://computerhistory.org/blog/steve-jobs/' }],
    ...cambios,
  }
}

describe('historiaPublicable', () => {
  it('una historia completa se puede publicar', () => {
    expect(historiaPublicable(historia(), ANIO)).toBe(true)
  })

  it('sin ninguna fuente no se publica: lo que no se puede comprobar no sale', () => {
    expect(historiaPublicable(historia({ fuentes: [] }), ANIO)).toBe(false)
  })

  it('cada fuente lleva su texto y su enlace', () => {
    expect(historiaPublicable(historia({ fuentes: [{ texto: '', href: 'https://computerhistory.org/blog/steve-jobs/' }] }), ANIO)).toBe(false)
    expect(historiaPublicable(historia({ fuentes: [{ texto: 'Wikipedia', href: '' }] }), ANIO)).toBe(false)
  })

  it('el enlace de cada fuente tiene que ser seguro: https, sin usuario y hacia un sitio con nombre', () => {
    const buena = { texto: 'Buena', href: 'https://example.com/a' }
    for (const href of ['http://example.com/a', 'https://banco.com@otro.com/', 'https://192.168.0.1/', 'javascript:alert(1)', 'no es un enlace']) {
      expect(historiaPublicable(historia({ fuentes: [{ texto: 'Fuente', href }] }), ANIO)).toBe(false)
      // basta una mala entre varias
      expect(historiaPublicable(historia({ fuentes: [buena, { texto: 'Mala', href }] }), ANIO)).toBe(false)
    }
  })

  it('Wikipedia no cuenta como fuente: hace falta una universidad, un museo, una revista o la propia empresa', () => {
    for (const href of ['https://en.wikipedia.org/wiki/Apple_Inc.', 'https://es.wikipedia.org/wiki/Nike', 'https://pt.m.wikipedia.org/wiki/Airbnb', 'https://wikipedia.org/wiki/Rappi']) {
      expect(historiaPublicable(historia({ fuentes: [{ texto: 'Wikipedia', href }] }), ANIO), href).toBe(false)
      // basta una de Wikipedia entre varias buenas
      expect(historiaPublicable(historia({ fuentes: [{ texto: 'Buena', href: 'https://example.com/a' }, { texto: 'Wikipedia', href }] }), ANIO), href).toBe(false)
    }
    expect(historiaPublicable(historia({ fuentes: [{ texto: 'Un sitio que solo se parece', href: 'https://wikipedia.example.com/a' }] }), ANIO)).toBe(true)
  })

  it('puede tener hasta tres fuentes, no más', () => {
    expect(LIMITES_HISTORIAS.fuentes).toEqual({ min: 1, max: 3 })
    const fuente = (n: number) => ({ texto: `Fuente ${n}`, href: `https://example.com/${n}` })
    expect(historiaPublicable(historia({ fuentes: [fuente(1), fuente(2)] }), ANIO)).toBe(true)
    expect(historiaPublicable(historia({ fuentes: [fuente(1), fuente(2), fuente(3)] }), ANIO)).toBe(true)
    expect(historiaPublicable(historia({ fuentes: [fuente(1), fuente(2), fuente(3), fuente(4)] }), ANIO)).toBe(false)
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

  describe('fotos', () => {
    const [a, b] = historia().personas
    const conFoto = (fotoA: string | undefined, fotoB: string | undefined) => historia({ personas: [{ ...a!, foto: fotoA }, { ...b!, foto: fotoB }] })

    it('las fotos son opcionales: una historia sin ninguna se publica', () => {
      expect(historiaPublicable(conFoto(undefined, undefined), ANIO)).toBe(true)
    })

    it('si hay fotos, son del propio sitio (una ruta que empieza por /), no de otro sitio', () => {
      expect(historiaPublicable(conFoto('/founders-legends/apple/steve_jobs.jfif', '/founders-legends/apple/steve_wosniak.jpg'), ANIO)).toBe(true)
      for (const mala of ['https://example.com/a.jpg', '//example.com/a.jpg', 'founders-legends/a.jpg', 'javascript:alert(1)', '/../secreto.jpg', '/a/../../b.jpg', '/con espacios.jpg', '/a.jpg?x=1', '']) {
        expect(historiaPublicable(conFoto(mala, '/founders-legends/b.jpg'), ANIO), mala).toBe(false)
        expect(historiaPublicable(conFoto('/founders-legends/a.jpg', mala), ANIO), mala).toBe(false)
      }
    })

    it('o todas las personas llevan foto o ninguna: mezclar fotos con iniciales se ve desparejo', () => {
      expect(historiaPublicable(conFoto('/founders-legends/a.jpg', undefined), ANIO)).toBe(false)
      expect(historiaPublicable(conFoto(undefined, '/founders-legends/b.jpg'), ANIO)).toBe(false)
    })
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
