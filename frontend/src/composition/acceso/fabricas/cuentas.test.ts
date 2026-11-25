import { afterEach, describe, expect, it, vi } from 'vitest'
import { HttpCuentaRepository } from '@/modules/acceso/infrastructure/http/HttpCuentaRepository'
import { MockCuentaRepository } from '@/modules/acceso/infrastructure/mock/MockCuentaRepository'
import { crearCuentaRepository } from './cuentas'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('crearCuentaRepository', () => {
  it('con los simulados activos devuelve el simulado, sin pedir la dirección de la API', () => {
    vi.stubEnv('NEXT_PUBLIC_USAR_MOCKS_ACCESO', 'true')
    vi.stubEnv('URL_API', '')

    expect(crearCuentaRepository('203.0.113.7')).toBeInstanceOf(MockCuentaRepository)
  })

  it('con los simulados apagados devuelve el adaptador de la API', () => {
    vi.stubEnv('NEXT_PUBLIC_USAR_MOCKS_ACCESO', 'false')
    vi.stubEnv('URL_API', 'https://api.nomadas.example')

    expect(crearCuentaRepository('203.0.113.7')).toBeInstanceOf(HttpCuentaRepository)
  })

  it('cualquier valor que no sea «true» apaga el simulado', () => {
    vi.stubEnv('URL_API', 'https://api.nomadas.example')
    for (const valor of ['', 'TRUE', '1', 'si']) {
      vi.stubEnv('NEXT_PUBLIC_USAR_MOCKS_ACCESO', valor)
      expect(crearCuentaRepository()).toBeInstanceOf(HttpCuentaRepository)
    }
  })

  it('sin la dirección de la API dice qué falta, sin inventar una', () => {
    vi.stubEnv('NEXT_PUBLIC_USAR_MOCKS_ACCESO', 'false')
    vi.stubEnv('URL_API', '')

    expect(() => crearCuentaRepository()).toThrow('URL_API')
  })

  it('un secreto interno demasiado corto es un error de configuración, no se usa en silencio', () => {
    vi.stubEnv('NEXT_PUBLIC_USAR_MOCKS_ACCESO', 'false')
    vi.stubEnv('URL_API', 'https://api.nomadas.example')
    vi.stubEnv('SECRETO_INTERNO_API', 'corto')

    expect(() => crearCuentaRepository('203.0.113.7')).toThrow()
  })

  it('con una dirección http fuera de localhost falla: el secreto viajaría sin cifrar', () => {
    vi.stubEnv('NEXT_PUBLIC_USAR_MOCKS_ACCESO', 'false')
    vi.stubEnv('URL_API', 'http://api.nomadas.example')

    expect(() => crearCuentaRepository()).toThrow()
  })

  it('acepta http en localhost para desarrollar', () => {
    vi.stubEnv('NEXT_PUBLIC_USAR_MOCKS_ACCESO', 'false')
    vi.stubEnv('URL_API', 'http://localhost:8100')

    expect(crearCuentaRepository()).toBeInstanceOf(HttpCuentaRepository)
  })
})

describe('crearCuentaRepository: lo que llega al backend', () => {
  const SECRETO = 'secreto-interno-' + 'x'.repeat(24)

  function simularFetch() {
    const peticiones: Headers[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        peticiones.push(new Headers(init?.headers))
        return new Response(JSON.stringify({ token_acceso: 'a', expira_en: 900, token_renovacion: 'r', correo: 'ana@correo.com' }), {
          status: 200,
        })
      }),
    )
    return peticiones
  }

  it('reenvía la IP de la persona y el secreto interno', async () => {
    const peticiones = simularFetch()
    vi.stubEnv('NEXT_PUBLIC_USAR_MOCKS_ACCESO', 'false')
    vi.stubEnv('URL_API', 'https://api.nomadas.example')
    vi.stubEnv('SECRETO_INTERNO_API', SECRETO)

    await crearCuentaRepository('203.0.113.7').iniciarSesion('ana@correo.com', 'Clave-segura1')

    expect(peticiones[0]?.get('x-origen-cliente')).toBe('203.0.113.7')
    expect(peticiones[0]?.get('x-secreto-interno')).toBe(SECRETO)
  })

  it('sin secreto interno configurado no manda ni la IP ni el secreto', async () => {
    const peticiones = simularFetch()
    vi.stubEnv('NEXT_PUBLIC_USAR_MOCKS_ACCESO', 'false')
    vi.stubEnv('URL_API', 'https://api.nomadas.example')
    vi.stubEnv('SECRETO_INTERNO_API', '')

    await crearCuentaRepository('203.0.113.7').iniciarSesion('ana@correo.com', 'Clave-segura1')

    expect(peticiones[0]?.get('x-origen-cliente')).toBeNull()
    expect(peticiones[0]?.get('x-secreto-interno')).toBeNull()
  })

  it('sin IP de la persona no manda el secreto', async () => {
    const peticiones = simularFetch()
    vi.stubEnv('NEXT_PUBLIC_USAR_MOCKS_ACCESO', 'false')
    vi.stubEnv('URL_API', 'https://api.nomadas.example')
    vi.stubEnv('SECRETO_INTERNO_API', SECRETO)

    await crearCuentaRepository().iniciarSesion('ana@correo.com', 'Clave-segura1')

    expect(peticiones[0]?.get('x-secreto-interno')).toBeNull()
  })
})
