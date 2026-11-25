import { ErrorDeApi, ErrorDeConfiguracionApi, ErrorDeRed } from './errores'

// El cliente con el que el SERVIDOR de Next habla con la API del backend. No es para el navegador: lleva un secreto
// compartido y la IP real de la persona (ver contrato/autenticacion.md, «Origen de la petición»).
// No sabe nada de cuentas ni de sesiones: manda y recibe JSON y traduce los fallos a errores tipados.

const ESPERA_POR_DEFECTO_MS = 10_000
const MAXIMO_DE_RESPUESTA = 1_000_000
const LARGO_MINIMO_DEL_SECRETO = 32
const ANFITRIONES_LOCALES = new Set(['localhost', '127.0.0.1'])

// Solo caracteres sin significado especial en una URL: ninguna ruta puede cambiar de servidor ni llevar datos
const RUTA_VALIDA = /^\/(?!\/)[A-Za-z0-9\-._~/]*$/
// Una IPv4 o IPv6: así «desconocido» no se manda, y ningún valor puede llevar saltos de línea a una cabecera
const IP_VALIDA = /^[0-9a-fA-F:.]{2,45}$/
const SEGUNDOS_DE_ESPERA = /^\d{1,7}$/

export type OpcionesClienteHttp = {
  /** Dirección de la API. Debe ser https (http solo en localhost, para desarrollo) */
  urlBase: string
  /** El secreto compartido con el backend (SECRETO_INTERNO). Sin él no se reenvía la IP */
  secretoInterno?: string
  /** La IP real de la persona que origina la petición */
  origen?: string
  /** Cuánto se espera la respuesta antes de rendirse */
  esperaMaximaMs?: number
  /** Para las pruebas; por defecto, el `fetch` global */
  fetch?: typeof fetch
}

export type Solicitud = {
  json?: unknown
  /** Token de acceso: se manda como `Authorization: Bearer` */
  token?: string
}

export type RespuestaApi = { estado: number; cuerpo: unknown }

export type ClienteHttp = {
  solicitar(metodo: 'GET' | 'POST', ruta: string, solicitud?: Solicitud): Promise<RespuestaApi>
}

function validarUrlBase(urlBase: string): string {
  let url: URL
  try {
    url = new URL(urlBase.trim())
  } catch {
    throw new ErrorDeConfiguracionApi('La URL de la API no es válida')
  }
  const esLocal = ANFITRIONES_LOCALES.has(url.hostname)
  const protocoloSeguro = url.protocol === 'https:' || (url.protocol === 'http:' && esLocal)
  // Con http fuera de localhost, el secreto y los tokens viajarían sin cifrar
  if (!url.hostname || !protocoloSeguro) throw new ErrorDeConfiguracionApi('La URL de la API debe ser https (http solo en localhost)')
  return `${url.origin}${url.pathname.replace(/\/+$/, '')}`
}

function validarRuta(ruta: string): void {
  const segmentos = ruta.split('/')
  if (!RUTA_VALIDA.test(ruta) || segmentos.includes('..') || segmentos.includes('.')) {
    throw new ErrorDeConfiguracionApi('La ruta de la API no es válida')
  }
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor)
}

function soloTexto(campos: Record<string, unknown>): Record<string, string> {
  const resultado: Record<string, string> = {}
  for (const [campo, codigo] of Object.entries(campos)) {
    if (typeof codigo === 'string') resultado[campo] = codigo
  }
  return resultado
}

function segundosDe(cabecera: string | null): number | undefined {
  return cabecera !== null && SEGUNDOS_DE_ESPERA.test(cabecera) ? Number(cabecera) : undefined
}

function errorDeApi(respuesta: Response, texto: string): ErrorDeApi {
  let codigo = 'fallo'
  let campos: Record<string, string> = {}
  try {
    const cuerpo: unknown = JSON.parse(texto)
    if (esObjeto(cuerpo)) {
      if (typeof cuerpo.codigo === 'string' && cuerpo.codigo !== '' && cuerpo.codigo.length <= 64) codigo = cuerpo.codigo
      if (esObjeto(cuerpo.campos)) campos = soloTexto(cuerpo.campos)
    }
  } catch {
    // El cuerpo no es JSON (una página de error de un proxy, por ejemplo): el código se queda en «fallo»
  }
  return new ErrorDeApi(respuesta.status, codigo, campos, segundosDe(respuesta.headers.get('retry-after')))
}

function interpretar(respuesta: Response, texto: string): RespuestaApi {
  if (texto.length > MAXIMO_DE_RESPUESTA) throw new ErrorDeApi(respuesta.status, 'respuesta_invalida')
  const exito = respuesta.status >= 200 && respuesta.status < 300
  if (!exito) throw errorDeApi(respuesta, texto)
  if (texto === '') return { estado: respuesta.status, cuerpo: undefined }
  try {
    return { estado: respuesta.status, cuerpo: JSON.parse(texto) as unknown }
  } catch {
    throw new ErrorDeApi(respuesta.status, 'respuesta_invalida')
  }
}

export function crearClienteHttp(opciones: OpcionesClienteHttp): ClienteHttp {
  const urlBase = validarUrlBase(opciones.urlBase)
  const secreto = opciones.secretoInterno ?? ''
  if (secreto !== '' && secreto.length < LARGO_MINIMO_DEL_SECRETO) {
    throw new ErrorDeConfiguracionApi(`El secreto interno debe tener al menos ${LARGO_MINIMO_DEL_SECRETO} caracteres`)
  }
  const esperaMs = opciones.esperaMaximaMs ?? ESPERA_POR_DEFECTO_MS
  const ejecutar: typeof fetch = opciones.fetch ?? ((entrada, init) => fetch(entrada, init))
  const origen = (opciones.origen ?? '').trim()
  // El secreto solo se manda junto a una IP válida: sin la IP no sirve de nada y no hay motivo para exponerlo
  const reenviar = secreto !== '' && IP_VALIDA.test(origen)

  return {
    async solicitar(metodo, ruta, solicitud = {}) {
      validarRuta(ruta)
      const cabeceras: Record<string, string> = { accept: 'application/json' }
      if (solicitud.json !== undefined) cabeceras['content-type'] = 'application/json'
      if (solicitud.token !== undefined) cabeceras.authorization = `Bearer ${solicitud.token}`
      if (reenviar) {
        cabeceras['x-origen-cliente'] = origen
        cabeceras['x-secreto-interno'] = secreto
      }

      const controlador = new AbortController()
      const temporizador = setTimeout(() => controlador.abort(), esperaMs)
      try {
        let respuesta: Response
        let texto: string
        try {
          respuesta = await ejecutar(`${urlBase}${ruta}`, {
            method: metodo,
            headers: cabeceras,
            body: solicitud.json === undefined ? undefined : JSON.stringify(solicitud.json),
            signal: controlador.signal,
            // Sin cookies del navegador, sin caché, y sin seguir redirecciones: una redirección podría llevarse
            // el secreto y el token a otro servidor
            credentials: 'omit',
            cache: 'no-store',
            redirect: 'error',
          })
          texto = await respuesta.text()
        } catch {
          // El mensaje original no se conserva: podría llevar la dirección, el secreto o datos de la persona
          throw new ErrorDeRed(controlador.signal.aborted ? 'tiempo_agotado' : 'sin_conexion')
        }
        return interpretar(respuesta, texto)
      } finally {
        clearTimeout(temporizador)
      }
    },
  }
}
