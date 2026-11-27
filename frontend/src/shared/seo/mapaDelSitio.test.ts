import { describe, expect, it } from 'vitest'
import { entradasDelMapa, reglasDeRobots } from './mapaDelSitio'

const SITIO = new URL('https://somosnomadas.app')

describe('entradasDelMapa', () => {
  it('cada ruta pública sale en los tres idiomas, con direcciones absolutas y enlazada a sus otras versiones', () => {
    const entradas = entradasDelMapa(SITIO, ['/eventos'])

    expect(entradas.map((e) => e.url)).toEqual([
      'https://somosnomadas.app/es/eventos',
      'https://somosnomadas.app/en/eventos',
      'https://somosnomadas.app/pt/eventos',
    ])
    const versiones = {
      es: 'https://somosnomadas.app/es/eventos',
      en: 'https://somosnomadas.app/en/eventos',
      pt: 'https://somosnomadas.app/pt/eventos',
      'x-default': 'https://somosnomadas.app/es/eventos',
    }
    for (const entrada of entradas) expect(entrada.alternates).toEqual({ languages: versiones })
  })

  it('la portada es la ruta vacía, sin barra final', () => {
    expect(entradasDelMapa(SITIO, ['']).map((e) => e.url)).toEqual([
      'https://somosnomadas.app/es',
      'https://somosnomadas.app/en',
      'https://somosnomadas.app/pt',
    ])
  })

  it('no inventa fechas de modificación: solo dirección e idiomas', () => {
    for (const entrada of entradasDelMapa(SITIO, ['', '/registro'])) expect(Object.keys(entrada).sort()).toEqual(['alternates', 'url'])
  })
})

describe('reglasDeRobots', () => {
  it('deja pasar a todos (las páginas privadas se protegen con noindex, que hay que poder leer) y señala el mapa', () => {
    expect(reglasDeRobots(SITIO)).toEqual({
      rules: { userAgent: '*', allow: '/' },
      sitemap: 'https://somosnomadas.app/sitemap.xml',
    })
  })
})
