import { describe, expect, it } from 'vitest'
import { urlDelSitio } from './direcciones'

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
