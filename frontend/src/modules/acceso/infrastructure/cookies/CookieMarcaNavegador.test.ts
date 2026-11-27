// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { tieneFormaDeMarca } from '../../domain/confirmacion'
import { CookieMarcaNavegador, SEGUNDOS_DE_LA_MARCA } from './CookieMarcaNavegador'

// Un `cookies()` de Next falso: un mapa que anota lo que se escribe
const guardadas = new Map<string, { valor: string; opciones: Record<string, unknown> }>()
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (nombre: string) => (guardadas.has(nombre) ? { name: nombre, value: guardadas.get(nombre)?.valor ?? '' } : undefined),
    set: (nombre: string, valor: string, opciones: Record<string, unknown>) => void guardadas.set(nombre, { valor, opciones }),
  }),
}))

beforeEach(() => {
  guardadas.clear()
  vi.unstubAllEnvs()
})

describe('CookieMarcaNavegador', () => {
  it('crea una marca aleatoria con forma de marca y la guarda en una cookie httpOnly de 15 minutos', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const marca = new CookieMarcaNavegador()

    const valor = await marca.crear()

    expect(tieneFormaDeMarca(valor)).toBe(true)
    expect(valor).toHaveLength(43) // 32 bytes en base64 de URL: 256 bits
    expect(guardadas.get('__Host-nomadas_navegador')).toEqual({
      valor,
      opciones: { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: SEGUNDOS_DE_LA_MARCA },
    })
    expect(SEGUNDOS_DE_LA_MARCA).toBe(15 * 60)
    expect(await marca.leer()).toBe(valor)
  })

  it('cada marca es distinta', async () => {
    const marca = new CookieMarcaNavegador()
    const valores = new Set<string>()
    for (let i = 0; i < 50; i++) valores.add(await marca.crear())

    expect(valores.size).toBe(50)
  })

  it('en desarrollo usa el nombre sin prefijo y sin Secure', async () => {
    vi.stubEnv('NODE_ENV', 'development')

    await new CookieMarcaNavegador().crear()

    expect(guardadas.get('nomadas_navegador')?.opciones).toMatchObject({ secure: false, httpOnly: true })
    expect(guardadas.has('__Host-nomadas_navegador')).toBe(false)
  })

  it('una cookie que no tiene forma de marca se lee como si no hubiera', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const marca = new CookieMarcaNavegador()

    expect(await marca.leer()).toBeUndefined()
    for (const valor of ['', 'corta', 'con espacios aaaaaaaaaaaaaaaaaaa', 'a'.repeat(201)]) {
      guardadas.set('__Host-nomadas_navegador', { valor, opciones: {} })
      expect(await marca.leer()).toBeUndefined()
    }
  })

  it('borrar la vacía con duración cero', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const marca = new CookieMarcaNavegador()
    await marca.crear()

    await marca.borrar()

    expect(guardadas.get('__Host-nomadas_navegador')).toMatchObject({ valor: '', opciones: { maxAge: 0, httpOnly: true } })
    expect(await marca.leer()).toBeUndefined()
  })
})
