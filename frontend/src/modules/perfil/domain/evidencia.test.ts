import { describe, expect, it } from 'vitest'
import { esEnlaceSeguro, hayErroresEvidencia, LIMITES_EVIDENCIA, limpiarEvidencia, normalizarEnlace, validarEvidencia } from './evidencia'

describe('normalizarEnlace', () => {
  it('acepta un enlace https y lo deja normalizado', () => {
    expect(normalizarEnlace('  https://GitHub.com/anatorres ')).toBe('https://github.com/anatorres')
    expect(normalizarEnlace('https://anatorres.example')).toBe('https://anatorres.example/')
  })

  it('rechaza los que no son https', () => {
    for (const mal of ['http://anatorres.example', 'ftp://anatorres.example', 'javascript:alert(1)', 'data:text/html,hola', 'anatorres.example', '//anatorres.example', '']) {
      expect(normalizarEnlace(mal), mal).toBeUndefined()
    }
  })

  it('rechaza los que llevan usuario o clave, que sirven para engañar sobre a dónde llevan', () => {
    expect(normalizarEnlace('https://banco.com@otro.example/entrar')).toBeUndefined()
    expect(normalizarEnlace('https://usuario:clave@otro.example')).toBeUndefined()
  })

  it('rechaza los que no apuntan a un sitio con nombre: sin punto, direcciones numéricas y locales', () => {
    for (const mal of ['https://localhost', 'https://intranet', 'https://127.0.0.1', 'https://192.168.1.10/panel', 'https://[::1]/']) {
      expect(normalizarEnlace(mal), mal).toBeUndefined()
    }
  })
})

describe('esEnlaceSeguro', () => {
  it('dice si el enlace se acepta', () => {
    expect(esEnlaceSeguro('https://anatorres.example/tienda')).toBe(true)
    expect(esEnlaceSeguro('http://anatorres.example/tienda')).toBe(false)
  })
})

describe('validarEvidencia', () => {
  it('una lista vacía es válida', () => {
    expect(hayErroresEvidencia(validarEvidencia([]))).toBe(false)
  })

  it('acepta hasta cinco enlaces y rechaza el sexto', () => {
    const cinco = Array.from({ length: LIMITES_EVIDENCIA.enlaces }, (_, i) => `https://a.example/${i}`)
    expect(hayErroresEvidencia(validarEvidencia(cinco))).toBe(false)
    expect(validarEvidencia([...cinco, 'https://a.example/6']).lista).toBe('demasiados')
  })

  it('dice qué enlace falla, por su lugar en la lista', () => {
    const errores = validarEvidencia(['https://a.example/1', 'http://a.example/2', ''])
    expect(errores.enlaces).toEqual({ 1: 'enlaceInvalido', 2: 'enlaceInvalido' })
  })

  it('rechaza los repetidos aunque estén escritos distinto', () => {
    const errores = validarEvidencia(['https://A.example/x', 'https://a.example/x', 'https://a.example'])
    expect(errores.enlaces).toEqual({ 1: 'repetido' })
    expect(validarEvidencia(['https://a.example', 'https://a.example/']).enlaces).toEqual({ 1: 'repetido' })
  })

  it('rechaza los enlaces demasiado largos', () => {
    const largo = `https://a.example/${'x'.repeat(LIMITES_EVIDENCIA.largo)}`
    expect(validarEvidencia([largo]).enlaces).toEqual({ 0: 'enlaceLargo' })
  })
})

describe('limpiarEvidencia', () => {
  it('los deja normalizados y en el mismo orden', () => {
    expect(limpiarEvidencia(['  https://B.example/y ', 'https://a.example'])).toEqual(['https://b.example/y', 'https://a.example/'])
  })

  it('no deja pasar los que no se pueden normalizar', () => {
    expect(limpiarEvidencia(['http://a.example', 'https://a.example/ok'])).toEqual(['https://a.example/ok'])
  })
})
