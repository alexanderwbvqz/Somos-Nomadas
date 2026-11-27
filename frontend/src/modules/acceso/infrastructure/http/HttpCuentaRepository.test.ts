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

    await expect(new HttpCuentaRepository(cliente).registrar(cuenta, 'es')).resolves.toBeUndefined()

    expect(llamadas).toEqual([
      {
        metodo: 'POST',
        ruta: '/acceso/registro',
        solicitud: {
          json: { correo: 'ana@correo.com', clave: 'Clave-segura1', acepta_politica: true, sitio_secundario: '', idioma: 'es' },
        },
      },
    ])
  })

  it('con la marca del navegador la manda en el campo navegador', async () => {
    const { cliente, llamadas } = clienteFalso(ok(undefined, 202))

    await new HttpCuentaRepository(cliente).registrar(cuenta, 'pt', 'marca-del-navegador-0123456789')

    expect(llamadas[0]?.solicitud?.json).toMatchObject({ idioma: 'pt', navegador: 'marca-del-navegador-0123456789' })
  })

  it('un límite excedido es ErrorDeLimite con los segundos de espera', async () => {
    const { cliente } = clienteFalso(falla(new ErrorDeApi(429, 'limite_excedido', {}, 3600)))

    const error = await captura(new HttpCuentaRepository(cliente).registrar(cuenta, 'es'))

    expect(error).toBeInstanceOf(ErrorDeLimite)
    expect((error as ErrorDeLimite).reintentarEnSegundos).toBe(3600)
  })

  it('datos que la API rechaza son ErrorDeCamposInvalidos, ya con los nombres del dominio', async () => {
    const { cliente } = clienteFalso(falla(new ErrorDeApi(422, 'datos_invalidos', { acepta_politica: 'politica_requerida', clave: 'clave_corta' })))

    const error = await captura(new HttpCuentaRepository(cliente).registrar(cuenta, 'es'))

    expect(error).toBeInstanceOf(ErrorDeCamposInvalidos)
    expect((error as ErrorDeCamposInvalidos).campos).toEqual({ aceptaPolitica: 'politicaRequerida', clave: 'claveCorta' })
  })

  it('cualquier otro fallo se deja pasar tal cual', async () => {
    const caida = new ErrorDeApi(500, 'fallo')
    const sinRed = new ErrorDeRed('sin_conexion')

    expect(await captura(new HttpCuentaRepository(clienteFalso(falla(caida)).cliente).registrar(cuenta, 'es'))).toBe(caida)
    expect(await captura(new HttpCuentaRepository(clienteFalso(falla(sinRed)).cliente).registrar(cuenta, 'es'))).toBe(sinRed)
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

describe('HttpCuentaRepository.reenviarConfirmacion', () => {
  it('manda POST /acceso/confirmacion/reenvio con el correo y el idioma', async () => {
    const { cliente, llamadas } = clienteFalso(ok(undefined, 202))

    await expect(new HttpCuentaRepository(cliente).reenviarConfirmacion('ana@correo.com', 'pt')).resolves.toBeUndefined()

    expect(llamadas).toEqual([
      { metodo: 'POST', ruta: '/acceso/confirmacion/reenvio', solicitud: { json: { correo: 'ana@correo.com', idioma: 'pt' } } },
    ])
  })

  it('con la marca del navegador la manda en el campo navegador', async () => {
    const { cliente, llamadas } = clienteFalso(ok(undefined, 202))

    await new HttpCuentaRepository(cliente).reenviarConfirmacion('ana@correo.com', 'es', 'marca-del-navegador-0123456789')

    expect(llamadas[0]?.solicitud?.json).toEqual({ correo: 'ana@correo.com', idioma: 'es', navegador: 'marca-del-navegador-0123456789' })
  })

  it('un límite excedido es ErrorDeLimite y un correo rechazado es ErrorDeCamposInvalidos', async () => {
    const limite = clienteFalso(falla(new ErrorDeApi(429, 'limite_excedido', {}, 3600))).cliente
    const rechazado = clienteFalso(falla(new ErrorDeApi(422, 'datos_invalidos', { correo: 'correo_invalido' }))).cliente

    expect(await captura(new HttpCuentaRepository(limite).reenviarConfirmacion('a@b.co', 'es'))).toBeInstanceOf(ErrorDeLimite)
    const error = await captura(new HttpCuentaRepository(rechazado).reenviarConfirmacion('a@b', 'es'))
    expect((error as ErrorDeCamposInvalidos).campos).toEqual({ correo: 'correoInvalido' })
  })

  it('cualquier otro fallo se deja pasar tal cual', async () => {
    const sinRed = new ErrorDeRed('sin_conexion')

    expect(await captura(new HttpCuentaRepository(clienteFalso(falla(sinRed)).cliente).reenviarConfirmacion('a@b.co', 'es'))).toBe(sinRed)
  })
})

describe('HttpCuentaRepository.confirmarCorreo', () => {
  const TOKEN = 'kVmM4x6ra2TdRrgU23duyfSBxrvhOwiN71QK2GzTuZ8'

  it('manda POST /acceso/confirmacion con el token y devuelve el correo confirmado', async () => {
    const { cliente, llamadas } = clienteFalso(ok({ correo: 'ana@correo.com' }))

    expect(await new HttpCuentaRepository(cliente).confirmarCorreo(TOKEN)).toEqual({ correo: 'ana@correo.com' })
    expect(llamadas).toEqual([{ metodo: 'POST', ruta: '/acceso/confirmacion', solicitud: { json: { token: TOKEN } } }])
  })

  it('con la marca del navegador la manda y, si la API abre la sesión, devuelve también la credencial', async () => {
    const sesion = { token_acceso: 'a.b.c', expira_en: 900, token_renovacion: 'renovacion-secreta' }
    const { cliente, llamadas } = clienteFalso(ok({ correo: 'ana@correo.com', sesion }))

    const confirmado = await new HttpCuentaRepository(cliente).confirmarCorreo(TOKEN, 'marca-del-navegador-0123456789')

    expect(confirmado).toEqual({
      correo: 'ana@correo.com',
      credencial: { acceso: 'a.b.c', renovacion: 'renovacion-secreta', expiraEnSegundos: 900 },
    })
    expect(llamadas[0]?.solicitud?.json).toEqual({ token: TOKEN, navegador: 'marca-del-navegador-0123456789' })
  })

  it('una sesión a medias es un error, no una confirmación sin sesión', async () => {
    const { cliente } = clienteFalso(ok({ correo: 'ana@correo.com', sesion: { token_acceso: 'a.b.c' } }))

    await expect(new HttpCuentaRepository(cliente).confirmarCorreo(TOKEN, 'marca-del-navegador-0123456789')).rejects.toThrow('inesperada')
  })

  it('un 400 enlace_invalido es undefined: el enlace no vale', async () => {
    const { cliente } = clienteFalso(falla(new ErrorDeApi(400, 'enlace_invalido')))

    expect(await new HttpCuentaRepository(cliente).confirmarCorreo(TOKEN)).toBeUndefined()
  })

  it('un límite excedido es ErrorDeLimite; los demás fallos se dejan pasar', async () => {
    const caida = new ErrorDeApi(500, 'fallo')

    expect(await captura(new HttpCuentaRepository(clienteFalso(falla(new ErrorDeApi(429, 'limite_excedido'))).cliente).confirmarCorreo(TOKEN))).toBeInstanceOf(ErrorDeLimite)
    expect(await captura(new HttpCuentaRepository(clienteFalso(falla(caida)).cliente).confirmarCorreo(TOKEN))).toBe(caida)
  })

  it('una respuesta sin el correo es un error, no una confirmación, y no repite el token', async () => {
    const { cliente } = clienteFalso(ok({ ok: true }))

    const error = (await captura(new HttpCuentaRepository(cliente).confirmarCorreo(TOKEN))) as Error

    expect(error.message).toContain('inesperada')
    expect(`${error.message} ${JSON.stringify(error)}`).not.toContain(TOKEN)
  })
})

describe('HttpCuentaRepository: lo que la API todavía no tiene', () => {
  it('Google falla con un mensaje claro, sin llamar a la API', async () => {
    const { cliente, llamadas } = clienteFalso(ok())
    // Se prueba a través del puerto, que es como lo usa el resto del código
    const repositorio: CuentaRepository = new HttpCuentaRepository(cliente)

    await expect(repositorio.iniciarConGoogle('credencial')).rejects.toThrow('todavía no está disponible')
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
