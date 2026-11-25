// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CookieAlmacenDeSesion } from './CookieAlmacenDeSesion'

// Un `cookies()` de Next falso: un mapa que anota lo que se escribe
const guardadas = new Map<string, { valor: string; opciones: Record<string, unknown> }>()
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (nombre: string) => (guardadas.has(nombre) ? { name: nombre, value: guardadas.get(nombre)?.valor ?? '' } : undefined),
    set: (nombre: string, valor: string, opciones: Record<string, unknown>) => void guardadas.set(nombre, { valor, opciones }),
  }),
}))

const credencial = { acceso: 'a.b.c', renovacion: 'renovacion-1', expiraEnSegundos: 900 }

beforeEach(() => {
  guardadas.clear()
  vi.unstubAllEnvs()
})

describe('CookieAlmacenDeSesion', () => {
  it('guarda la credencial en dos cookies httpOnly y la lee de vuelta', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const almacen = new CookieAlmacenDeSesion()

    await almacen.guardar(credencial)

    expect(guardadas.get('__Host-nomadas_acceso')).toMatchObject({ valor: 'a.b.c', opciones: { httpOnly: true, secure: true, sameSite: 'lax', path: '/' } })
    expect(guardadas.get('__Host-nomadas_renovacion')?.valor).toBe('renovacion-1')
    expect(await almacen.leer()).toEqual({ acceso: 'a.b.c', renovacion: 'renovacion-1' })
  })

  it('en desarrollo usa los nombres sin prefijo y sin Secure', async () => {
    vi.stubEnv('NODE_ENV', 'development')

    await new CookieAlmacenDeSesion().guardar(credencial)

    expect(guardadas.get('nomadas_acceso')?.opciones).toMatchObject({ secure: false })
    expect(guardadas.has('__Host-nomadas_acceso')).toBe(false)
  })

  it('borrar las vacía con duración cero', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const almacen = new CookieAlmacenDeSesion()
    await almacen.guardar(credencial)

    await almacen.borrar()

    expect(guardadas.get('__Host-nomadas_acceso')).toMatchObject({ valor: '', opciones: { maxAge: 0 } })
    expect(guardadas.get('__Host-nomadas_renovacion')).toMatchObject({ valor: '', opciones: { maxAge: 0 } })
    expect(await almacen.leer()).toEqual({ acceso: undefined, renovacion: undefined })
  })

  it('sin cookies, no hay sesión', async () => {
    expect(await new CookieAlmacenDeSesion().leer()).toEqual({ acceso: undefined, renovacion: undefined })
  })
})
