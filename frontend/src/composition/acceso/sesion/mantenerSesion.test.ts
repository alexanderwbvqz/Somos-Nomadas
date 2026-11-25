// @vitest-environment node
import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { CuentaRepository } from '@/modules/acceso/domain/CuentaRepository'
import type { CredencialDeSesion } from '@/modules/acceso/domain/sesion'
import { mantenerSesion } from './mantenerSesion'

const nueva: CredencialDeSesion = { acceso: 'acceso.nuevo.firma', renovacion: 'renovacion-nueva', expiraEnSegundos: 900 }

function repositorioQue(renovar: (renovacion: string) => Promise<CredencialDeSesion | undefined>): CuentaRepository {
  const noDebiaLlamarse = async (): Promise<never> => {
    throw new Error('no debía llamarse')
  }
  return {
    registrar: noDebiaLlamarse,
    iniciarSesion: noDebiaLlamarse,
    iniciarConGoogle: noDebiaLlamarse,
    reenviarConfirmacion: noDebiaLlamarse,
    cerrarSesion: noDebiaLlamarse,
    obtenerCuenta: noDebiaLlamarse,
    renovarSesion: renovar,
  }
}

function peticion(cookies: Record<string, string> = {}, cabeceras: Record<string, string> = {}) {
  const cookie = Object.entries(cookies)
    .map(([nombre, valor]) => `${nombre}=${valor}`)
    .join('; ')
  return new NextRequest('http://localhost:3000/es/perfil', { headers: { ...(cookie ? { cookie } : {}), ...cabeceras } })
}

const setCookies = (respuesta: Response) => respuesta.headers.getSetCookie()

afterEach(() => vi.unstubAllEnvs())

describe('mantenerSesion', () => {
  it('sin cookies de sesión deja pasar la petición sin tocar nada ni llamar al backend', async () => {
    const renovar = vi.fn()

    const respuesta = await mantenerSesion(peticion(), () => repositorioQue(renovar))

    expect(setCookies(respuesta)).toEqual([])
    expect(renovar).not.toHaveBeenCalled()
  })

  it('con el acceso vigente no renueva', async () => {
    const renovar = vi.fn()

    const respuesta = await mantenerSesion(
      peticion({ nomadas_acceso: 'a.b.c', nomadas_renovacion: 'r1' }),
      () => repositorioQue(renovar),
    )

    expect(setCookies(respuesta)).toEqual([])
    expect(renovar).not.toHaveBeenCalled()
  })

  it('con el acceso caducado y la renovación viva, renueva y guarda las dos cookies nuevas', async () => {
    const renovar = vi.fn<(renovacion: string) => Promise<CredencialDeSesion>>(async () => nueva)

    const respuesta = await mantenerSesion(peticion({ nomadas_renovacion: 'r1' }), () => repositorioQue(renovar))

    expect(renovar).toHaveBeenCalledWith('r1')
    const cookies = setCookies(respuesta)
    expect(cookies).toHaveLength(2)
    expect(cookies.find((c) => c.startsWith('nomadas_acceso='))).toContain('acceso.nuevo.firma')
    expect(cookies.find((c) => c.startsWith('nomadas_renovacion='))).toContain('renovacion-nueva')
    for (const cookie of cookies) expect(cookie.toLowerCase()).toContain('httponly')
  })

  it('la página que se está pidiendo ya ve las cookies nuevas, no las viejas', async () => {
    const respuesta = await mantenerSesion(peticion({ nomadas_renovacion: 'r1' }), () => repositorioQue(async () => nueva))

    // Next pasa a la página las cookies de la petición en esta cabecera interna
    const paraLaPagina = respuesta.headers.get('x-middleware-request-cookie') ?? ''
    expect(paraLaPagina).toContain('nomadas_acceso=acceso.nuevo.firma')
    expect(paraLaPagina).toContain('nomadas_renovacion=renovacion-nueva')
    expect(paraLaPagina).not.toContain('r1')
  })

  it('si el backend rechaza la renovación, borra las cookies para no insistir con un token muerto', async () => {
    const respuesta = await mantenerSesion(
      peticion({ nomadas_renovacion: 'r-muerta' }),
      () => repositorioQue(async () => undefined),
    )

    const cookies = setCookies(respuesta)
    expect(cookies).toHaveLength(2)
    for (const cookie of cookies) expect(cookie).toMatch(/Max-Age=0/i)
    expect(respuesta.headers.get('x-middleware-request-cookie') ?? '').not.toContain('r-muerta')
  })

  it('si el backend no responde no toca nada: la sesión sigue y se reintenta en la próxima petición', async () => {
    const respuesta = await mantenerSesion(
      peticion({ nomadas_renovacion: 'r1' }),
      () =>
        repositorioQue(async () => {
          throw new Error('sin conexión')
        }),
    )

    expect(setCookies(respuesta)).toEqual([])
  })

  it('en producción usa las cookies __Host- y las guarda Secure', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    const respuesta = await mantenerSesion(
      peticion({ '__Host-nomadas_renovacion': 'r1' }),
      () => repositorioQue(async () => nueva),
    )

    const cookies = setCookies(respuesta)
    expect(cookies.map((c) => c.split('=')[0]).sort()).toEqual(['__Host-nomadas_acceso', '__Host-nomadas_renovacion'])
    for (const cookie of cookies) expect(cookie).toMatch(/;\s*Secure/i)
  })

  it('un token con caracteres raros se ignora: ni se manda al backend', async () => {
    const renovar = vi.fn()

    await mantenerSesion(peticion({ nomadas_renovacion: 'a"b' }), () => repositorioQue(renovar))

    expect(renovar).not.toHaveBeenCalled()
  })

  it('al backend le pasa la IP de quien navega, para que cuente por persona', async () => {
    const origenes: (string | undefined)[] = []

    await mantenerSesion(
      peticion({ nomadas_renovacion: 'r1' }, { 'x-forwarded-for': '203.0.113.7' }),
      (origen) => {
        origenes.push(origen)
        return repositorioQue(async () => nueva)
      },
    )

    expect(origenes).toEqual(['203.0.113.7'])
  })

  it('dos peticiones a la vez con la misma renovación renuevan una sola vez y comparten el resultado', async () => {
    let llamadas = 0
    let terminar: (c: CredencialDeSesion) => void = () => undefined
    const renovar = () => {
      llamadas += 1
      return new Promise<CredencialDeSesion>((resolver) => {
        terminar = resolver
      })
    }

    const a = mantenerSesion(peticion({ nomadas_renovacion: 'r1' }), () => repositorioQue(renovar))
    const b = mantenerSesion(peticion({ nomadas_renovacion: 'r1' }), () => repositorioQue(renovar))
    await Promise.resolve()
    terminar(nueva)
    const [respuestaA, respuestaB] = await Promise.all([a, b])

    expect(llamadas).toBe(1)
    expect(setCookies(respuestaA)).toHaveLength(2)
    expect(setCookies(respuestaB)).toHaveLength(2)
  })

  it('una renovación distinta no espera a la otra, y cuando termina una ya se puede volver a renovar', async () => {
    const renovar = vi.fn<(renovacion: string) => Promise<CredencialDeSesion>>(async () => nueva)

    await mantenerSesion(peticion({ nomadas_renovacion: 'r1' }), () => repositorioQue(renovar))
    await mantenerSesion(peticion({ nomadas_renovacion: 'r1' }), () => repositorioQue(renovar))
    await mantenerSesion(peticion({ nomadas_renovacion: 'r2' }), () => repositorioQue(renovar))

    expect(renovar.mock.calls.map(([renovacion]) => renovacion)).toEqual(['r1', 'r1', 'r2'])
  })

  it('si crear el repositorio falla (falta configuración) deja pasar la petición en vez de romper la página', async () => {
    const respuesta = await mantenerSesion(peticion({ nomadas_renovacion: 'r1' }), () => {
      throw new Error('Falta URL_API')
    })

    expect(setCookies(respuesta)).toEqual([])
  })
})
