// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { crearClienteHttp, type OpcionesClienteHttp } from './clienteHttp'
import { ErrorDeApi, ErrorDeConfiguracionApi, ErrorDeRed } from './errores'

const SECRETO = 'secreto-interno-' + 'x'.repeat(24)
const BASE = 'https://api.nomadas.example'

type Llamada = { url: string; init: RequestInit }

/** Un fetch falso: anota lo que se le pide y responde lo que se le programe */
function fetchFalso(responder: (llamada: Llamada) => Response | Promise<Response>) {
  const llamadas: Llamada[] = []
  const fetchSimulado = (async (url: string | URL | Request, init?: RequestInit) => {
    const llamada = { url: String(url), init: init ?? {} }
    llamadas.push(llamada)
    return await responder(llamada)
  }) as typeof fetch
  return { fetch: fetchSimulado, llamadas }
}

function json(cuerpo: unknown, estado = 200, cabeceras: Record<string, string> = {}) {
  return new Response(JSON.stringify(cuerpo), { status: estado, headers: { 'content-type': 'application/json', ...cabeceras } })
}

function cliente(opciones: Partial<OpcionesClienteHttp> & { fetch: typeof fetch }) {
  return crearClienteHttp({ urlBase: BASE, ...opciones })
}

/** El error con el que falla una petición; si no falla, la prueba falla */
async function capturar(promesa: Promise<unknown>): Promise<Error> {
  try {
    await promesa
  } catch (error) {
    return error as Error
  }
  throw new Error('La petición debía fallar')
}

function cabecera(llamada: Llamada | undefined, nombre: string): string | null {
  return new Headers(llamada?.init.headers).get(nombre)
}

describe('crearClienteHttp: la URL de la API', () => {
  const { fetch } = fetchFalso(() => json({}))

  it.each(['https://api.nomadas.example', 'https://api.nomadas.example/', 'http://localhost:8100', 'http://127.0.0.1:8100'])(
    'acepta %s',
    (urlBase) => {
      expect(() => crearClienteHttp({ urlBase, fetch })).not.toThrow()
    },
  )

  it.each(['', '   ', 'no-es-una-url', 'http://api.nomadas.example', 'ftp://api.nomadas.example', 'https://'])(
    'rechaza «%s»: con http la clave y el secreto viajarían sin cifrar fuera de localhost',
    (urlBase) => {
      expect(() => crearClienteHttp({ urlBase, fetch })).toThrow(ErrorDeConfiguracionApi)
    },
  )

  it('el mensaje de error de configuración no repite la URL ni el secreto', () => {
    try {
      crearClienteHttp({ urlBase: 'http://api.privada.example', secretoInterno: SECRETO, origen: '1.2.3.4', fetch })
      expect.unreachable()
    } catch (error) {
      expect(String(error)).not.toContain('privada')
      expect(String(error)).not.toContain(SECRETO)
    }
  })

  it('con barra final o sin ella pide la misma dirección', async () => {
    for (const urlBase of [BASE, `${BASE}/`]) {
      const falso = fetchFalso(() => json({}))
      await crearClienteHttp({ urlBase, fetch: falso.fetch }).solicitar('GET', '/acceso/yo')
      expect(falso.llamadas[0]?.url).toBe(`${BASE}/acceso/yo`)
    }
  })
})

describe('crearClienteHttp: el secreto interno', () => {
  const { fetch } = fetchFalso(() => json({}))

  it('exige 32 caracteres o más, igual que el backend', () => {
    expect(() => crearClienteHttp({ urlBase: BASE, secretoInterno: 'corto', fetch })).toThrow(ErrorDeConfiguracionApi)
    expect(() => crearClienteHttp({ urlBase: BASE, secretoInterno: 'x'.repeat(31), fetch })).toThrow(ErrorDeConfiguracionApi)
    expect(() => crearClienteHttp({ urlBase: BASE, secretoInterno: 'x'.repeat(32), fetch })).not.toThrow()
  })

  it('un secreto vacío equivale a no tenerlo (por ejemplo, en desarrollo)', () => {
    expect(() => crearClienteHttp({ urlBase: BASE, secretoInterno: '', fetch })).not.toThrow()
  })
})

describe('crearClienteHttp: lo que se envía', () => {
  it('manda el método, la dirección y el cuerpo en JSON, y no manda nada de identidad por defecto', async () => {
    const falso = fetchFalso(() => json({}))

    await cliente({ fetch: falso.fetch }).solicitar('POST', '/acceso/sesion', { json: { correo: 'ana@correo.com', clave: 'x' } })

    const llamada = falso.llamadas[0]
    expect(llamada?.url).toBe(`${BASE}/acceso/sesion`)
    expect(llamada?.init.method).toBe('POST')
    expect(llamada?.init.body).toBe(JSON.stringify({ correo: 'ana@correo.com', clave: 'x' }))
    expect(cabecera(llamada, 'accept')).toBe('application/json')
    expect(cabecera(llamada, 'content-type')).toBe('application/json')
    expect(cabecera(llamada, 'authorization')).toBeNull()
    expect(cabecera(llamada, 'x-origen-cliente')).toBeNull()
    expect(cabecera(llamada, 'x-secreto-interno')).toBeNull()
  })

  it('una petición sin cuerpo no lleva content-type ni body', async () => {
    const falso = fetchFalso(() => json({}))

    await cliente({ fetch: falso.fetch }).solicitar('GET', '/acceso/yo')

    expect(falso.llamadas[0]?.init.body).toBeUndefined()
    expect(cabecera(falso.llamadas[0], 'content-type')).toBeNull()
  })

  it('con un token manda Authorization: Bearer', async () => {
    const falso = fetchFalso(() => json({}))

    await cliente({ fetch: falso.fetch }).solicitar('GET', '/acceso/yo', { token: 'abc.def.ghi' })

    expect(cabecera(falso.llamadas[0], 'authorization')).toBe('Bearer abc.def.ghi')
  })

  it('no manda cookies, no guarda en caché y no sigue redirecciones', async () => {
    const falso = fetchFalso(() => json({}))

    await cliente({ fetch: falso.fetch }).solicitar('GET', '/acceso/yo')

    // Una redirección podría llevarse el secreto y el token a otro servidor
    expect(falso.llamadas[0]?.init.credentials).toBe('omit')
    expect(falso.llamadas[0]?.init.cache).toBe('no-store')
    expect(falso.llamadas[0]?.init.redirect).toBe('error')
  })

  it('reenvía la IP real y el secreto cuando tiene los dos', async () => {
    const falso = fetchFalso(() => json({}))

    await cliente({ fetch: falso.fetch, secretoInterno: SECRETO, origen: '203.0.113.7' }).solicitar('POST', '/acceso/registro')

    expect(cabecera(falso.llamadas[0], 'x-origen-cliente')).toBe('203.0.113.7')
    expect(cabecera(falso.llamadas[0], 'x-secreto-interno')).toBe(SECRETO)
  })

  it('recorta los espacios de la IP antes de reenviarla', async () => {
    const falso = fetchFalso(() => json({}))

    await cliente({ fetch: falso.fetch, secretoInterno: SECRETO, origen: ' 203.0.113.7 ' }).solicitar('POST', '/acceso/registro')

    expect(cabecera(falso.llamadas[0], 'x-origen-cliente')).toBe('203.0.113.7')
  })

  it.each([
    ['solo el secreto', { secretoInterno: SECRETO }],
    ['solo la IP', { origen: '203.0.113.7' }],
    ['la IP sin determinar', { secretoInterno: SECRETO, origen: 'desconocido' }],
    ['la IP vacía', { secretoInterno: SECRETO, origen: '' }],
  ])('con %s no manda ninguna de las dos cabeceras internas', async (_nombre, opciones) => {
    const falso = fetchFalso(() => json({}))

    await cliente({ fetch: falso.fetch, ...opciones }).solicitar('POST', '/acceso/registro')

    // El secreto no sirve de nada sin la IP, y no hay motivo para exponerlo
    expect(cabecera(falso.llamadas[0], 'x-origen-cliente')).toBeNull()
    expect(cabecera(falso.llamadas[0], 'x-secreto-interno')).toBeNull()
  })

  it.each(['acceso/yo', '//evil.example/x', 'https://evil.example/x', '/acceso\\yo', '', '/a b', '/../x', '/acceso/..%2fx'])(
    'rechaza la ruta «%s»: una ruta nunca debe poder cambiar de servidor',
    async (ruta) => {
      const falso = fetchFalso(() => json({}))

      await expect(cliente({ fetch: falso.fetch }).solicitar('GET', ruta)).rejects.toBeInstanceOf(ErrorDeConfiguracionApi)
      expect(falso.llamadas).toHaveLength(0)
    },
  )
})

describe('crearClienteHttp: lo que devuelve', () => {
  it('con un 200 devuelve el estado y el cuerpo ya leído', async () => {
    const falso = fetchFalso(() => json({ token_acceso: 'a', expira_en: 900 }))

    const respuesta = await cliente({ fetch: falso.fetch }).solicitar('POST', '/acceso/sesion')

    expect(respuesta).toEqual({ estado: 200, cuerpo: { token_acceso: 'a', expira_en: 900 } })
  })

  it.each([202, 204])('con un %i sin cuerpo devuelve el cuerpo vacío', async (estado) => {
    const falso = fetchFalso(() => new Response(null, { status: estado }))

    const respuesta = await cliente({ fetch: falso.fetch }).solicitar('POST', '/acceso/registro')

    expect(respuesta).toEqual({ estado, cuerpo: undefined })
  })

  it('un éxito cuyo cuerpo no es JSON es un error de respuesta inválida', async () => {
    const falso = fetchFalso(() => new Response('<html>no soy json</html>', { status: 200 }))

    await expect(cliente({ fetch: falso.fetch }).solicitar('GET', '/acceso/yo')).rejects.toMatchObject({
      name: 'ErrorDeApi',
      estado: 200,
      codigo: 'respuesta_invalida',
    })
  })

  it('una respuesta enorme se rechaza antes de procesarla, aunque sea un JSON válido', async () => {
    // Un JSON válido: si el tope no existiera, se leería sin problema
    const falso = fetchFalso(() => new Response(JSON.stringify('x'.repeat(1_200_000)), { status: 200 }))

    await expect(cliente({ fetch: falso.fetch }).solicitar('GET', '/acceso/yo')).rejects.toMatchObject({ codigo: 'respuesta_invalida' })
  })
})

describe('crearClienteHttp: los errores de la API', () => {
  async function fallo(respuesta: Response): Promise<ErrorDeApi> {
    const falso = fetchFalso(() => respuesta)
    try {
      await cliente({ fetch: falso.fetch }).solicitar('POST', '/acceso/sesion')
    } catch (error) {
      expect(error).toBeInstanceOf(ErrorDeApi)
      return error as ErrorDeApi
    }
    throw new Error('Debía fallar')
  }

  it('un error con código lo conserva, junto con el estado', async () => {
    const error = await fallo(json({ codigo: 'credenciales_invalidas' }, 401))

    expect(error.estado).toBe(401)
    expect(error.codigo).toBe('credenciales_invalidas')
    expect(error.campos).toEqual({})
    expect(error.reintentarEnSegundos).toBeUndefined()
  })

  it('un 422 lleva los campos con su código', async () => {
    const error = await fallo(json({ codigo: 'datos_invalidos', campos: { correo: 'correo_invalido', clave: 'clave_corta' } }, 422))

    expect(error.codigo).toBe('datos_invalidos')
    expect(error.campos).toEqual({ correo: 'correo_invalido', clave: 'clave_corta' })
  })

  it('de los campos solo se conservan los que son texto', async () => {
    const error = await fallo(json({ codigo: 'datos_invalidos', campos: { correo: 'obligatorio', clave: 5, otro: null, raro: { a: 1 } } }, 422))

    expect(error.campos).toEqual({ correo: 'obligatorio' })
  })

  it('un código de más de 64 caracteres no se acepta: es «fallo»', async () => {
    const error = await fallo(json({ codigo: 'c'.repeat(65) }, 500))

    expect(error.codigo).toBe('fallo')
  })

  it('un código de 64 caracteres sí se acepta', async () => {
    const error = await fallo(json({ codigo: 'c'.repeat(64) }, 500))

    expect(error.codigo).toBe('c'.repeat(64))
  })

  it('un 429 lleva los segundos de espera de Retry-After', async () => {
    const error = await fallo(json({ codigo: 'limite_excedido' }, 429, { 'retry-after': '900' }))

    expect(error.codigo).toBe('limite_excedido')
    expect(error.reintentarEnSegundos).toBe(900)
  })

  it.each(['pronto', '-5', '1.5', '', '99999999999999'])('un Retry-After inválido («%s») se ignora', async (valor) => {
    const error = await fallo(json({ codigo: 'limite_excedido' }, 429, { 'retry-after': valor }))

    expect(error.reintentarEnSegundos).toBeUndefined()
  })

  it.each([
    ['un cuerpo que no es JSON', new Response('Internal Server Error', { status: 500 })],
    ['un JSON sin código', json({ mensaje: 'algo' }, 500)],
    ['un código que no es texto', json({ codigo: 42 }, 500)],
    ['un cuerpo vacío', new Response(null, { status: 502 })],
    ['un array', json(['x'], 500)],
  ])('con %s el código es «fallo»', async (_nombre, respuesta) => {
    const error = await fallo(respuesta)

    expect(error.codigo).toBe('fallo')
  })

  it('cualquier respuesta que no sea 2xx es un error, también una 3xx', async () => {
    const error = await fallo(new Response(null, { status: 302, headers: { location: 'https://otro.example' } }))

    expect(error).toBeInstanceOf(ErrorDeApi)
    expect(error.estado).toBe(302)
  })
})

describe('crearClienteHttp: los fallos de red', () => {
  it('una conexión que falla es un ErrorDeRed sin_conexion', async () => {
    const falso = fetchFalso(() => {
      throw new TypeError('fetch failed: ECONNREFUSED')
    })

    await expect(cliente({ fetch: falso.fetch }).solicitar('GET', '/acceso/yo')).rejects.toMatchObject({
      name: 'ErrorDeRed',
      causa: 'sin_conexion',
    })
  })

  it('un servidor que no responde a tiempo es un ErrorDeRed tiempo_agotado', async () => {
    const fetchLento = ((_url: string, init?: RequestInit) =>
      new Promise((_resolver, rechazar) => {
        init?.signal?.addEventListener('abort', () => rechazar(new DOMException('abortado', 'AbortError')))
      })) as unknown as typeof fetch

    await expect(cliente({ fetch: fetchLento, esperaMaximaMs: 20 }).solicitar('GET', '/acceso/yo')).rejects.toMatchObject({
      name: 'ErrorDeRed',
      causa: 'tiempo_agotado',
    })
  })

  it('una redirección (que fetch rechaza por la opción redirect: error) es un fallo de conexión', async () => {
    const falso = fetchFalso(() => {
      throw new TypeError('redirect mode is set to error')
    })

    await expect(cliente({ fetch: falso.fetch }).solicitar('GET', '/acceso/yo')).rejects.toBeInstanceOf(ErrorDeRed)
  })

  it('el error de red no repite el mensaje original, que podría llevar datos de la petición', async () => {
    const falso = fetchFalso(() => {
      throw new TypeError(`fetch failed a ${BASE} con ${SECRETO} y ana@correo.com`)
    })
    const error = await capturar(
      cliente({ fetch: falso.fetch, secretoInterno: SECRETO, origen: '203.0.113.7' }).solicitar('POST', '/acceso/sesion', {
        token: 'token-secreto',
        json: { clave: 'Clave-segura1' },
      }),
    )

    const texto = `${error.message} ${String(error)} ${JSON.stringify(error)}`
    for (const secreto of [SECRETO, 'token-secreto', 'Clave-segura1', 'ana@correo.com', '203.0.113.7']) {
      expect(texto).not.toContain(secreto)
    }
  })

  it('el error de la API tampoco lleva el token ni el secreto', async () => {
    const falso = fetchFalso(() => json({ codigo: 'no_autenticado' }, 401))

    const error = await capturar(
      cliente({ fetch: falso.fetch, secretoInterno: SECRETO, origen: '203.0.113.7' }).solicitar('GET', '/acceso/yo', {
        token: 'token-secreto',
      }),
    )

    const texto = `${error.message} ${String(error)} ${JSON.stringify(error)}`
    expect(texto).not.toContain('token-secreto')
    expect(texto).not.toContain(SECRETO)
  })
})
