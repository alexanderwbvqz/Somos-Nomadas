import { afterEach, describe, expect, it, vi } from 'vitest'
import { MockHistoriasRepository } from '@/modules/landing/infrastructure/mock/MockHistoriasRepository'
import { crearHistoriasRepository } from './historias'

afterEach(() => vi.unstubAllEnvs())

describe('crearHistoriasRepository', () => {
  it('con NEXT_PUBLIC_USAR_MOCKS_LANDING=true usa el adaptador de ejemplo', () => {
    vi.stubEnv('NEXT_PUBLIC_USAR_MOCKS_LANDING', 'true')
    expect(crearHistoriasRepository()).toBeInstanceOf(MockHistoriasRepository)
  })

  it('sin esa variable falla diciendo cuál falta, porque el adaptador real todavía no existe', () => {
    vi.stubEnv('NEXT_PUBLIC_USAR_MOCKS_LANDING', '')
    expect(() => crearHistoriasRepository()).toThrow(/NEXT_PUBLIC_USAR_MOCKS_LANDING/)
  })

  it('con otro valor tampoco', () => {
    vi.stubEnv('NEXT_PUBLIC_USAR_MOCKS_LANDING', 'false')
    expect(() => crearHistoriasRepository()).toThrow(/NEXT_PUBLIC_USAR_MOCKS_LANDING/)
  })
})
