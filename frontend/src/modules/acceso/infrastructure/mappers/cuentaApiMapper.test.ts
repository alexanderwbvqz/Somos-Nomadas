import { describe, expect, it } from 'vitest'
import { ErrorDeApi } from '@/shared/api/errores'
import { ErrorDeCamposInvalidos, ErrorDeCorreoSinConfirmar, ErrorDeLimite } from '../../domain/errores'
import {
  camposDelDominio,
  cuerpoDeInicioSesion,
  cuerpoDeRegistro,
  esCredencialesInvalidas,
  esNoAutenticado,
  traducirErrorDeApi,
} from './cuentaApiMapper'

describe('esNoAutenticado', () => {
  it('solo es un 401 con el código no_autenticado: la sesión no vale', () => {
    expect(esNoAutenticado(new ErrorDeApi(401, 'no_autenticado'))).toBe(true)
  })

  it('un 401 con otro código (un proxy, otra cosa) no tira la sesión', () => {
    expect(esNoAutenticado(new ErrorDeApi(401, 'fallo'))).toBe(false)
    expect(esNoAutenticado(new ErrorDeApi(401, 'credenciales_invalidas'))).toBe(false)
  })

  it('el código sin el estado 401 tampoco', () => {
    expect(esNoAutenticado(new ErrorDeApi(403, 'no_autenticado'))).toBe(false)
    expect(esNoAutenticado(new ErrorDeApi(500, 'no_autenticado'))).toBe(false)
  })

  it('lo que no es un error de la API no lo es', () => {
    expect(esNoAutenticado(new Error('x'))).toBe(false)
    expect(esNoAutenticado(undefined)).toBe(false)
  })
})

describe('cuerpoDeRegistro', () => {
  it('usa los nombres de campo de la API y manda el campo trampa vacío', () => {
    expect(cuerpoDeRegistro({ correo: 'ana@correo.com', clave: ' Clave-1 ', aceptaPolitica: true })).toEqual({
      correo: 'ana@correo.com',
      clave: ' Clave-1 ',
      acepta_politica: true,
      sitio_secundario: '',
    })
  })
})

describe('cuerpoDeInicioSesion', () => {
  it('manda el correo y la clave tal cual', () => {
    expect(cuerpoDeInicioSesion('ana@correo.com', ' Clave-1 ')).toEqual({ correo: 'ana@correo.com', clave: ' Clave-1 ' })
  })
})

describe('camposDelDominio', () => {
  it('traduce los nombres de campo y los códigos de la API a los del dominio', () => {
    expect(
      camposDelDominio({
        correo: 'correo_invalido',
        clave: 'clave_corta',
        acepta_politica: 'politica_requerida',
      }),
    ).toEqual({ correo: 'correoInvalido', clave: 'claveCorta', aceptaPolitica: 'politicaRequerida' })
  })

  it.each([
    ['obligatorio', 'obligatorio'],
    ['correo_invalido', 'correoInvalido'],
    ['clave_corta', 'claveCorta'],
    ['clave_larga', 'claveLarga'],
    ['clave_sin_minuscula', 'claveSinMinuscula'],
    ['clave_sin_mayuscula', 'claveSinMayuscula'],
    ['clave_sin_numero', 'claveSinNumero'],
    ['clave_sin_especial', 'claveSinEspecial'],
    ['politica_requerida', 'politicaRequerida'],
  ])('el código %s es %s', (codigoApi, codigoDominio) => {
    expect(camposDelDominio({ clave: codigoApi })).toEqual({ clave: codigoDominio })
  })

  it('descarta los códigos que el dominio todavía no conoce, en vez de inventarles un significado', () => {
    expect(camposDelDominio({ clave: 'clave_muy_rara', correo: 'invalido', acepta_politica: 'otra_cosa' })).toEqual({})
  })

  it('descarta los campos que no son del formulario (el campo trampa, o uno nuevo de la API)', () => {
    expect(camposDelDominio({ sitio_secundario: 'obligatorio', token_renovacion: 'obligatorio', correo: 'obligatorio' })).toEqual({
      correo: 'obligatorio',
    })
  })

  it('no se confunde con nombres heredados del prototipo', () => {
    const campos = JSON.parse('{"constructor": "obligatorio", "__proto__": "obligatorio", "toString": "clave_corta"}') as Record<string, string>

    expect(camposDelDominio(campos)).toEqual({})
    expect(camposDelDominio({ clave: 'constructor' })).toEqual({})
  })
})

describe('traducirErrorDeApi', () => {
  const api = (estado: number, codigo: string, campos: Record<string, string> = {}, espera?: number) =>
    new ErrorDeApi(estado, codigo, campos, espera)

  it('un límite excedido es ErrorDeLimite, con los segundos que pide la API', () => {
    const error = traducirErrorDeApi(api(429, 'limite_excedido', {}, 900))

    expect(error).toBeInstanceOf(ErrorDeLimite)
    expect((error as ErrorDeLimite).reintentarEnSegundos).toBe(900)
  })

  it('el código limite_excedido basta aunque el estado sea otro', () => {
    expect(traducirErrorDeApi(api(503, 'limite_excedido'))).toBeInstanceOf(ErrorDeLimite)
  })

  it('un 429 sin código conocido también es un límite', () => {
    expect(traducirErrorDeApi(api(429, 'fallo'))).toBeInstanceOf(ErrorDeLimite)
  })

  it('datos_invalidos es ErrorDeCamposInvalidos, con los campos ya traducidos', () => {
    const error = traducirErrorDeApi(api(422, 'datos_invalidos', { correo: 'correo_invalido', clave: 'clave_larga' }))

    expect(error).toBeInstanceOf(ErrorDeCamposInvalidos)
    expect((error as ErrorDeCamposInvalidos).campos).toEqual({ correo: 'correoInvalido', clave: 'claveLarga' })
  })

  it('correo_sin_confirmar es ErrorDeCorreoSinConfirmar', () => {
    expect(traducirErrorDeApi(api(403, 'correo_sin_confirmar'))).toBeInstanceOf(ErrorDeCorreoSinConfirmar)
  })

  it.each([
    [500, 'fallo'],
    [401, 'no_autenticado'],
    [404, 'no_encontrado'],
    [200, 'respuesta_invalida'],
  ])('un %i «%s» se deja como está: el caso de uso lo tratará como un fallo', (estado, codigo) => {
    const original = api(estado, codigo)

    expect(traducirErrorDeApi(original)).toBe(original)
  })
})

describe('esCredencialesInvalidas', () => {
  it('es cierto solo para credenciales_invalidas', () => {
    expect(esCredencialesInvalidas(new ErrorDeApi(401, 'credenciales_invalidas'))).toBe(true)
    expect(esCredencialesInvalidas(new ErrorDeApi(401, 'no_autenticado'))).toBe(false)
    expect(esCredencialesInvalidas(new ErrorDeApi(403, 'correo_sin_confirmar'))).toBe(false)
    expect(esCredencialesInvalidas(new Error('credenciales_invalidas'))).toBe(false)
  })
})
