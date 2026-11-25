// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { crearClienteHttp, type ClienteHttp, type RespuestaApi, type Solicitud } from '@/shared/api/clienteHttp'
import { ErrorDeApi, ErrorDeRed } from '@/shared/api/errores'
import type { CuentaRepository } from '../../domain/CuentaRepository'
import { ErrorDeCamposInvalidos, ErrorDeCorreoSinConfirmar, ErrorDeLimite } from '../../domain/errores'
import { HttpCuentaRepository } from './HttpCuentaRepository'

type Llamada = { metodo: string; ruta: string; solicitud: Solicitud | undefined }

/** Un cliente HTTP falso: anota lo que se le pide y responde (o falla) como se le programe */
function clienteFalso(responder: () => Promise<RespuestaApi>) {
  const llamadas: Llamada[] = []
  const cliente: ClienteHttp = {
    async solicitar(metodo, ruta, solicitud) {
      llamadas.push({ metodo, ruta, solicitud })
      return await responder()
    },
  }
  return { cliente, llamadas }
}

const ok = (cuerpo: unknown = undefined, estado = 200) => async (): Promise<RespuestaApi> => ({ estado, cuerpo })
const falla = (error: Error) => async (): Promise<RespuestaApi> => {
  throw error
}
const sesionApi = { token_acceso: 'a.b.c', expira_en: 900, token_renovacion: 'renovacion-secreta', correo: 'ana@correo.com' }

async function captura(promesa: Promise<unknown>): Promise<unknown> {
  try {
    await promesa
  } catch (error) {
    return error
  }
  throw new Error('Debía fallar')
}

describe('HttpCuentaRepository.registrar', () => {
  const cuenta = { correo: 'ana@correo.com', clave: 'Clave-segura1', aceptaPolitica: true } as const

  it('manda POST /acceso/registro con los nombres de la API y no devuelve nada', async () => {
    const { cliente, llamadas } = clienteFalso(ok(undefined, 202))

    await expect(new HttpCuentaRepository(cliente).registrar(cuenta)).resolves.toBeUndefined()

    expect(llamadas).toEqual([
      {
        metodo: 'POST',
        ruta: '/acceso/registro',
        solicitud: { json: { correo: 'ana@correo.com', clave: 'Clave-segura1', acepta_politica: true, sitio_secundario: '' } },
      },
    ])
  })

  it('un límite excedido es ErrorDeLimite con los segundos de espera', async () => {
    const { cliente } = clienteFalso(falla(new ErrorDeApi(429, 'limite_excedido', {}, 3600)))

    const error = await captura(new HttpCuentaRepository(cliente).registrar(cuenta))

    expect(error).toBeInstanceOf(ErrorDeLimite)
    expect((error as ErrorDeLimite).reintentarEnSegundos).toBe(3600)
  })

  it('datos que la API rechaza son ErrorDeCamposInvalidos, ya con los nombres del dominio', async () => {
    const { cliente } = clienteFalso(falla(new ErrorDeApi(422, 'datos_invalidos', { acepta_politica: 'politica_requerida', clave: 'clave_corta' })))

    const error = await captura(new HttpCuentaRepository(cliente).registrar(cuenta))

    expect(error).toBeInstanceOf(ErrorDeCamposInvalidos)
    expect((error as ErrorDeCamposInvalidos).campos).toEqual({ aceptaPolitica: 'politicaRequerida', clave: 'claveCorta' })
  })

  it('cualquier otro fallo se deja pasar tal cual', async () => {
    const caida = new ErrorDeApi(500, 'fallo')
    const sinRed = new ErrorDeRed('sin_conexion')

    expect(await captura(new HttpCuentaRepository(clienteFalso(falla(caida)).cliente).registrar(cuenta))).toBe(caida)
    expect(await captura(new HttpCuentaRepository(clienteFalso(falla(sinRed)).cliente).registrar(cuenta))).toBe(sinRed)
  })
})

describe('HttpCuentaRepository.iniciarSesion', () => {
  it('manda POST /acceso/sesion y devuelve el correo y la credencial con los nombres del dominio', async () => {
    const { cliente, llamadas } = clienteFalso(ok(sesionApi))

    const cuenta = await new HttpCuentaRepository(cliente).iniciarSesion('ana@correo.com', 'Clave-segura1')

    expect(llamadas).toEqual([
      { metodo: 'POST', ruta: '/acceso/sesion', solicitud: { json: { correo: 'ana@correo.com', clave: 'Clave-segura1' } } },
    ])
    expect(cuenta).toEqual({ correo: 'ana@correo.com', credencial: { acceso: 'a.b.c', renovacion: 'renovacion-secreta', expiraEnSegundos: 900 } })
  })

  it('credenciales incorrectas devuelven undefined, sin decir cuál de los dos falla', async () => {
    const { cliente } = clienteFalso(falla(new ErrorDeApi(401, 'credenciales_invalidas')))

    expect(await new HttpCuentaRepository(cliente).iniciarSesion('ana@correo.com', 'mala')).toBeUndefined()
  })

  it('el correo sin confirmar es ErrorDeCorreoSinConfirmar', async () => {
    const { cliente } = clienteFalso(falla(new ErrorDeApi(403, 'correo_sin_confirmar')))

    expect(await captura(new HttpCuentaRepository(cliente).iniciarSesion('ana@correo.com', 'x'))).toBeInstanceOf(ErrorDeCorreoSinConfirmar)
  })

  it('un límite excedido es ErrorDeLimite', async () => {
    const { cliente } = clienteFalso(falla(new ErrorDeApi(429, 'limite_excedido', {}, 900)))

    const error = await captura(new HttpCuentaRepository(cliente).iniciarSesion('ana@correo.com', 'x'))

    expect(error).toBeInstanceOf(ErrorDeLimite)
    expect((error as ErrorDeLimite).reintentarEnSegundos).toBe(900)
  })

  it('datos que la API rechaza son ErrorDeCamposInvalidos', async () => {
    const { cliente } = clienteFalso(falla(new ErrorDeApi(422, 'datos_invalidos', { correo: 'obligatorio' })))

    const error = await captura(new HttpCuentaRepository(cliente).iniciarSesion('', 'x'))

    expect((error as ErrorDeCamposInvalidos).campos).toEqual({ correo: 'obligatorio' })
  })

  it('una respuesta que no tiene la forma del contrato es un error, no una cuenta', async () => {
    const { cliente } = clienteFalso(ok({ correo: 'ana@correo.com' }))

    await expect(new HttpCuentaRepository(cliente).iniciarSesion('ana@correo.com', 'x')).rejects.toThrow('inesperada')
  })

  it('cualquier otro fallo se deja pasar tal cual', async () => {
    const caida = new ErrorDeApi(500, 'fallo')

    expect(await captura(new HttpCuentaRepository(clienteFalso(falla(caida)).cliente).iniciarSesion('a@b.co', 'x'))).toBe(caida)
  })

  it('los errores no llevan la contraseña', async () => {
    const { cliente } = clienteFalso(falla(new ErrorDeApi(500, 'fallo')))

    const error = (await captura(new HttpCuentaRepository(cliente).iniciarSesion('ana@correo.com', 'Clave-secretisima-9'))) as Error

    expect(`${error.message} ${JSON.stringify(error)}`).not.toContain('Clave-secretisima-9')
  })
})

const credencialApi = { token_acceso: 'x.y.z', expira_en: 900, token_renovacion: 'renovacion-nueva' }

describe('HttpCuentaRepository.renovarSesion', () => {
  it('manda POST /acceso/renovar con el token de renovación y devuelve la credencial nueva', async () => {
    const { cliente, llamadas } = clienteFalso(ok(credencialApi))

    const credencial = await new HttpCuentaRepository(cliente).renovarSesion('renovacion-vieja')

    expect(llamadas).toEqual([{ metodo: 'POST', ruta: '/acceso/renovar', solicitud: { json: { token_renovacion: 'renovacion-vieja' } } }])
    expect(credencial).toEqual({ acceso: 'x.y.z', renovacion: 'renovacion-nueva', expiraEnSegundos: 900 })
  })

  it('un 401 es undefined: la sesión ya no vale', async () => {
    const { cliente } = clienteFalso(falla(new ErrorDeApi(401, 'no_autenticado')))

    expect(await new HttpCuentaRepository(cliente).renovarSesion('vieja')).toBeUndefined()
  })

  it('otros fallos no son un rechazo: se dejan pasar para no tirar la sesión por una caída del servidor', async () => {
    const caida = new ErrorDeApi(500, 'fallo')
    const sinRed = new ErrorDeRed('tiempo_agotado')
    const limite = new ErrorDeApi(429, 'limite_excedido', {}, 30)

    expect(await captura(new HttpCuentaRepository(clienteFalso(falla(caida)).cliente).renovarSesion('r'))).toBe(caida)
    expect(await captura(new HttpCuentaRepository(clienteFalso(falla(sinRed)).cliente).renovarSesion('r'))).toBe(sinRed)
    expect(await captura(new HttpCuentaRepository(clienteFalso(falla(limite)).cliente).renovarSesion('r'))).toBe(limite)
  })

  it('una respuesta que no tiene la forma del contrato es un error, no una credencial', async () => {
    const { cliente } = clienteFalso(ok({ token_acceso: 'x' }))

    await expect(new HttpCuentaRepository(cliente).renovarSesion('r')).rejects.toThrow('inesperada')
  })

  it('el token de renovación no queda en los errores', async () => {
    const error = (await captura(
      new HttpCuentaRepository(clienteFalso(ok({ token_acceso: 'x' })).cliente).renovarSesion('renovacion-ultrasecreta'),
    )) as Error

    expect(`${error.message} ${JSON.stringify(error)}`).not.toContain('renovacion-ultrasecreta')
  })
})

describe('HttpCuentaRepository.cerrarSesion', () => {
  it('manda POST /acceso/cierre con el token de renovación', async () => {
    const { cliente, llamadas } = clienteFalso(ok(undefined, 204))

    await expect(new HttpCuentaRepository(cliente).cerrarSesion('renovacion-1')).resolves.toBeUndefined()

    expect(llamadas).toEqual([{ metodo: 'POST', ruta: '/acceso/cierre', solicitud: { json: { token_renovacion: 'renovacion-1' } } }])
  })

  it('los fallos se dejan pasar: quien llama decide qué hacer si no se pudo avisar', async () => {
    const sinRed = new ErrorDeRed('sin_conexion')

    expect(await captura(new HttpCuentaRepository(clienteFalso(falla(sinRed)).cliente).cerrarSesion('r'))).toBe(sinRed)
  })
})

describe('HttpCuentaRepository.obtenerCuenta', () => {
  const yo = { id: '0b0e7a52-3f64-4a5e-8f6e-0c3c9b2f1a11', correo: 'ana@correo.com', correo_confirmado: true }

  it('manda GET /acceso/yo con el token de acceso y devuelve la cuenta con los nombres del dominio', async () => {
    const { cliente, llamadas } = clienteFalso(ok(yo))

    const cuenta = await new HttpCuentaRepository(cliente).obtenerCuenta('a.b.c')

    expect(llamadas).toEqual([{ metodo: 'GET', ruta: '/acceso/yo', solicitud: { token: 'a.b.c' } }])
    expect(cuenta).toEqual({ id: yo.id, correo: 'ana@correo.com', correoConfirmado: true })
  })

  it('un 401 es undefined: el acceso no vale', async () => {
    const { cliente } = clienteFalso(falla(new ErrorDeApi(401, 'no_autenticado')))

    expect(await new HttpCuentaRepository(cliente).obtenerCuenta('caducado')).toBeUndefined()
  })

  it('otros fallos se dejan pasar', async () => {
    const caida = new ErrorDeApi(500, 'fallo')

    expect(await captura(new HttpCuentaRepository(clienteFalso(falla(caida)).cliente).obtenerCuenta('a'))).toBe(caida)
  })

  it('una respuesta que no tiene la forma del contrato es un error', async () => {
    const { cliente } = clienteFalso(ok({ correo: 'ana@correo.com' }))

    await expect(new HttpCuentaRepository(cliente).obtenerCuenta('a')).rejects.toThrow('inesperada')
  })
})

describe('HttpCuentaRepository: lo que la API todavía no tiene', () => {
  it('Google y el reenvío de la confirmación fallan con un mensaje claro, sin llamar a la API', async () => {
    const { cliente, llamadas } = clienteFalso(ok())
    // Se prueba a través del puerto, que es como lo usa el resto del código
    const repositorio: CuentaRepository = new HttpCuentaRepository(cliente)

    await expect(repositorio.iniciarConGoogle('credencial')).rejects.toThrow('todavía no está disponible')
    await expect(repositorio.reenviarConfirmacion('ana@correo.com')).rejects.toThrow('todavía no está disponible')
    expect(llamadas).toHaveLength(0)
  })
})

describe('HttpCuentaRepository con el cliente HTTP de verdad', () => {
  it('habla con el contrato del backend: rutas, cuerpo, cabeceras internas y respuesta', async () => {
    const peticiones: { url: string; cuerpo: unknown; cabeceras: Headers }[] = []
    const fetchFalso = (async (url: string | URL | Request, init?: RequestInit) => {
      peticiones.push({ url: String(url), cuerpo: JSON.parse(String(init?.body)), cabeceras: new Headers(init?.headers) })
      return new Response(JSON.stringify(sesionApi), { status: 200, headers: { 'content-type': 'application/json' } })
    }) as typeof fetch
    const cliente = crearClienteHttp({
      urlBase: 'https://api.nomadas.example',
      secretoInterno: 'secreto-interno-' + 'x'.repeat(24),
      origen: '203.0.113.7',
      fetch: fetchFalso,
    })

    const cuenta = await new HttpCuentaRepository(cliente).iniciarSesion('ana@correo.com', 'Clave-segura1')

    expect(cuenta?.correo).toBe('ana@correo.com')
    expect(peticiones).toHaveLength(1)
    expect(peticiones[0]?.url).toBe('https://api.nomadas.example/acceso/sesion')
    expect(peticiones[0]?.cuerpo).toEqual({ correo: 'ana@correo.com', clave: 'Clave-segura1' })
    expect(peticiones[0]?.cabeceras.get('x-origen-cliente')).toBe('203.0.113.7')
  })

  it('traduce de punta a punta un 429 de la API a ErrorDeLimite', async () => {
    const fetchFalso = (async () =>
      new Response(JSON.stringify({ codigo: 'limite_excedido' }), { status: 429, headers: { 'retry-after': '900' } })) as typeof fetch
    const cliente = crearClienteHttp({ urlBase: 'https://api.nomadas.example', fetch: fetchFalso })

    const error = await captura(new HttpCuentaRepository(cliente).iniciarSesion('ana@correo.com', 'x'))

    expect(error).toBeInstanceOf(ErrorDeLimite)
    expect((error as ErrorDeLimite).reintentarEnSegundos).toBe(900)
  })
})
