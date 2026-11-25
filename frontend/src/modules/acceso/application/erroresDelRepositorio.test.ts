import { describe, expect, it } from 'vitest'
import { MockAlmacenDeSesion } from '../infrastructure/mock/MockAlmacenDeSesion'
import type { CuentaRepository } from '../domain/CuentaRepository'
import { datosRegistroVacios, type DatosRegistro } from '../domain/cuenta'
import { ErrorDeCamposInvalidos, ErrorDeCorreoSinConfirmar, ErrorDeLimite } from '../domain/errores'
import { continuarConGoogle } from './continuarConGoogle'
import { iniciarSesion } from './iniciarSesion'
import { reenviarConfirmacion } from './reenviarConfirmacion'
import { registrarCuenta } from './registrarCuenta'

// Lo que hace cada caso de uso cuando el repositorio (que puede ser el backend) rechaza algo.

function completos(): DatosRegistro {
  return { ...datosRegistroVacios(), correo: 'ana@correo.com', clave: 'Clave-segura-9', aceptaPolitica: true }
}

/** Un repositorio que falla siempre con el error dado */
function fallaCon(error: unknown): CuentaRepository {
  const fallar = async (): Promise<never> => {
    throw error
  }
  return {
    registrar: fallar,
    iniciarSesion: fallar,
    iniciarConGoogle: fallar,
    reenviarConfirmacion: fallar,
    renovarSesion: fallar,
    cerrarSesion: fallar,
    obtenerCuenta: fallar,
  }
}

describe('registrarCuenta cuando el repositorio rechaza', () => {
  it('por demasiados intentos, responde motivo limite', async () => {
    expect(await registrarCuenta(fallaCon(new ErrorDeLimite(900)), completos())).toEqual({ ok: false, errores: {}, motivo: 'limite' })
  })

  it('por datos que el servidor no acepta, devuelve esos errores por campo y ningún motivo', async () => {
    const error = new ErrorDeCamposInvalidos({ correo: 'correoInvalido', clave: 'claveCorta', aceptaPolitica: 'politicaRequerida' })

    expect(await registrarCuenta(fallaCon(error), completos())).toEqual({
      ok: false,
      errores: { correo: 'correoInvalido', clave: 'claveCorta', aceptaPolitica: 'politicaRequerida' },
    })
  })

  it('ignora los campos que el formulario no tiene', async () => {
    const error = new ErrorDeCamposInvalidos({ clave: 'claveLarga', otroCampo: 'obligatorio', sitioSecundario: 'obligatorio' })

    expect(await registrarCuenta(fallaCon(error), completos())).toEqual({ ok: false, errores: { clave: 'claveLarga' } })
  })

  it('si ninguno de los campos es del formulario, responde fallo en vez de un error sin campo', async () => {
    // Un error sin campos ni motivo no mostraría nada y la persona no sabría qué pasó
    const error = new ErrorDeCamposInvalidos({ otroCampo: 'obligatorio' })

    expect(await registrarCuenta(fallaCon(error), completos())).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
    expect(await registrarCuenta(fallaCon(new ErrorDeCamposInvalidos({})), completos())).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
  })

  it('solo cuentan los campos propios del error, no los heredados de otro objeto', async () => {
    const heredados = new ErrorDeCamposInvalidos(Object.create({ clave: 'claveCorta' }) as Record<string, never>)

    expect(await registrarCuenta(fallaCon(heredados), completos())).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
  })

  it('por cualquier otro error, responde fallo', async () => {
    expect(await registrarCuenta(fallaCon(new Error('x')), completos())).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
    expect(await registrarCuenta(fallaCon('texto'), completos())).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
  })

  it('el correo sin confirmar no es un motivo de un registro: es un fallo', async () => {
    expect(await registrarCuenta(fallaCon(new ErrorDeCorreoSinConfirmar()), completos())).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
  })
})

describe('iniciarSesion cuando el repositorio rechaza', () => {
  const datos = { correo: 'ana@correo.com', clave: 'Clave-segura-9' }

  it('por demasiados intentos, responde motivo limite', async () => {
    expect(await iniciarSesion(fallaCon(new ErrorDeLimite()), new MockAlmacenDeSesion(), datos)).toEqual({ ok: false, errores: {}, motivo: 'limite' })
  })

  it('con la clave correcta pero el correo sin confirmar, responde motivo sinConfirmar', async () => {
    expect(await iniciarSesion(fallaCon(new ErrorDeCorreoSinConfirmar()), new MockAlmacenDeSesion(), datos)).toEqual({ ok: false, errores: {}, motivo: 'sinConfirmar' })
  })

  it('por datos que el servidor no acepta, devuelve esos errores por campo', async () => {
    const error = new ErrorDeCamposInvalidos({ correo: 'correoInvalido', clave: 'claveLarga', aceptaPolitica: 'politicaRequerida' })

    // Un inicio de sesión no tiene política: ese campo no se muestra
    expect(await iniciarSesion(fallaCon(error), new MockAlmacenDeSesion(), datos)).toEqual({ ok: false, errores: { correo: 'correoInvalido', clave: 'claveLarga' } })
  })

  it('si ninguno de los campos es del formulario, responde fallo', async () => {
    const error = new ErrorDeCamposInvalidos({ aceptaPolitica: 'politicaRequerida' })

    expect(await iniciarSesion(fallaCon(error), new MockAlmacenDeSesion(), datos)).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
  })

  it('por cualquier otro error, responde fallo', async () => {
    expect(await iniciarSesion(fallaCon(new Error('x')), new MockAlmacenDeSesion(), datos)).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
  })
})

describe('continuarConGoogle y reenviarConfirmacion cuando el repositorio rechaza', () => {
  it('por demasiados intentos, responden motivo limite', async () => {
    expect(await continuarConGoogle(fallaCon(new ErrorDeLimite()), 'credencial')).toEqual({ ok: false, motivo: 'limite' })
    expect(await reenviarConfirmacion(fallaCon(new ErrorDeLimite()), 'ana@correo.com')).toEqual({ ok: false, motivo: 'limite' })
  })

  it('por cualquier otro error, responden fallo', async () => {
    expect(await continuarConGoogle(fallaCon(new Error('x')), 'credencial')).toEqual({ ok: false, motivo: 'fallo' })
    expect(await reenviarConfirmacion(fallaCon(new Error('x')), 'ana@correo.com')).toEqual({ ok: false, motivo: 'fallo' })
  })
})

describe('los errores del repositorio', () => {
  it('ErrorDeLimite lleva, si se sabe, los segundos de espera', () => {
    expect(new ErrorDeLimite(900).reintentarEnSegundos).toBe(900)
    expect(new ErrorDeLimite().reintentarEnSegundos).toBeUndefined()
  })

  it('son errores de verdad y se distinguen entre sí', () => {
    for (const error of [new ErrorDeLimite(), new ErrorDeCamposInvalidos({}), new ErrorDeCorreoSinConfirmar()]) {
      expect(error).toBeInstanceOf(Error)
    }
    expect(new ErrorDeLimite()).not.toBeInstanceOf(ErrorDeCorreoSinConfirmar)
    expect(new ErrorDeCorreoSinConfirmar()).not.toBeInstanceOf(ErrorDeLimite)
  })
})
