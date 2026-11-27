import { afterEach, describe, expect, it, vi } from 'vitest'
import { rutasPublicas } from './mapaDelSitio'

afterEach(() => vi.unstubAllEnvs())

describe('rutasPublicas', () => {
  it('con aliados y eventos de ejemplo, el mapa no los lista: no se publican datos inventados', () => {
    vi.stubEnv('NEXT_PUBLIC_USAR_MOCKS_ALIADOS', 'true')
    vi.stubEnv('NEXT_PUBLIC_USAR_MOCKS_EVENTOS', 'true')

    expect(rutasPublicas()).toEqual(['', '/registro', '/iniciar-sesion', '/aliados/postular'])
  })

  it('con datos reales, aliados y eventos entran en el mapa', () => {
    vi.stubEnv('NEXT_PUBLIC_USAR_MOCKS_ALIADOS', 'false')
    vi.stubEnv('NEXT_PUBLIC_USAR_MOCKS_EVENTOS', 'false')

    expect(rutasPublicas()).toEqual(['', '/registro', '/iniciar-sesion', '/aliados/postular', '/aliados', '/eventos'])
  })

  it('cada uno se decide por separado', () => {
    vi.stubEnv('NEXT_PUBLIC_USAR_MOCKS_ALIADOS', 'true')
    vi.stubEnv('NEXT_PUBLIC_USAR_MOCKS_EVENTOS', 'false')

    expect(rutasPublicas()).toEqual(['', '/registro', '/iniciar-sesion', '/aliados/postular', '/eventos'])
  })
})
