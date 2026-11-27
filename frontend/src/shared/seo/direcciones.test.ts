import { describe, expect, it } from 'vitest'
import { enlacesDeIdioma, urlDelSitio } from './direcciones'

describe('urlDelSitio', () => {
  it('usa la dirección configurada, sin la barra final', () => {
    expect(urlDelSitio('https://somosnomadas.app').href).toBe('https://somosnomadas.app/')
    expect(urlDelSitio('https://somosnomadas.app/').origin).toBe('https://somosnomadas.app')
    expect(urlDelSitio('  https://somosnomadas.app  ').origin).toBe('https://somosnomadas.app')
  })

  it('sin configurar (en local) usa el servidor de desarrollo', () => {
    expect(urlDelSitio(undefined).origin).toBe('http://localhost:3000')
    expect(urlDelSitio('').origin).toBe('http://localhost:3000')
    expect(urlDelSitio('   ').origin).toBe('http://localhost:3000')
  })

  it('una dirección mal escrita o que no es web falla al compilar, en vez de publicar enlaces rotos', () => {
    for (const valor of ['somosnomadas.app', 'ftp://somosnomadas.app', 'javascript:alert(1)', 'https://']) {
      expect(() => urlDelSitio(valor), valor).toThrow('NEXT_PUBLIC_URL_SITIO')
    }
  })

  it('solo se queda con el origen: una ruta en la variable no se cuela en los enlaces', () => {
    expect(urlDelSitio('https://somosnomadas.app/es/algo?x=1').href).toBe('https://somosnomadas.app/')
  })
})

describe('enlacesDeIdioma', () => {
  it('la canónica es la página en su idioma y enlaza sus versiones en los tres, con x-default en español', () => {
    expect(enlacesDeIdioma('en', '/aliados')).toEqual({
      canonical: '/en/aliados',
      languages: { es: '/es/aliados', en: '/en/aliados', pt: '/pt/aliados', 'x-default': '/es/aliados' },
    })
  })

  it('la portada es la ruta vacía: /es, /en y /pt, sin barra final', () => {
    expect(enlacesDeIdioma('pt', '')).toEqual({
      canonical: '/pt',
      languages: { es: '/es', en: '/en', pt: '/pt', 'x-default': '/es' },
    })
  })

  it.each(['aliados', '/aliados/', '/es/aliados', '/aliados?x=1', '/aliados#a', '//otro.com'])(
    'una ruta mal formada (%j) es un error del programa, no un enlace roto',
    (ruta) => {
      expect(() => enlacesDeIdioma('es', ruta)).toThrow('ruta')
    },
  )
})
