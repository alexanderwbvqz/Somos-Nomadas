import { beforeEach, describe, expect, it } from 'vitest'
import type { CuentaRepository } from '../domain/CuentaRepository'
import { datosRegistroVacios, type DatosRegistro } from '../domain/cuenta'
import { CORREO_GOOGLE_SIMULADO, MockCuentaRepository } from '../infrastructure/mock/MockCuentaRepository'
import { continuarConGoogle } from './continuarConGoogle'
import { iniciarSesion } from './iniciarSesion'
import { reenviarConfirmacion } from './reenviarConfirmacion'
import { registrarCuenta } from './registrarCuenta'

function completos(): DatosRegistro {
  return { ...datosRegistroVacios(), correo: 'ana@correo.com', clave: 'Clave-segura-9', aceptaPolitica: true }
}

const roto: CuentaRepository = {
  registrar: async () => { throw new Error('x') },
  iniciarSesion: async () => { throw new Error('x') },
  iniciarConGoogle: async () => { throw new Error('x') },
  reenviarConfirmacion: async () => { throw new Error('x') },
}

describe('registrarCuenta', () => {
  beforeEach(() => MockCuentaRepository.vaciar())

  it('crea la cuenta con datos válidos', async () => {
    expect(await registrarCuenta(new MockCuentaRepository(), completos())).toEqual({ ok: true, correo: 'ana@correo.com' })
    expect(MockCuentaRepository.cantidad()).toBe(1)
  })

  it('devuelve los errores y no crea nada si los datos no son válidos', async () => {
    const resultado = await registrarCuenta(new MockCuentaRepository(), datosRegistroVacios())
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) expect(resultado.errores.correo).toBe('obligatorio')
    expect(MockCuentaRepository.cantidad()).toBe(0)
  })

  it('a un robot le responde ok sin crear nada', async () => {
    expect((await registrarCuenta(new MockCuentaRepository(), { ...completos(), sitioSecundario: 'spam' })).ok).toBe(true)
    expect(MockCuentaRepository.cantidad()).toBe(0)
  })

  it('con un correo ya registrado responde igual y no duplica', async () => {
    const repositorio = new MockCuentaRepository()
    await registrarCuenta(repositorio, completos())
    expect(await registrarCuenta(repositorio, { ...completos(), clave: 'Otra-clave-1' })).toEqual({ ok: true, correo: 'ana@correo.com' })
    expect(MockCuentaRepository.cantidad()).toBe(1)
  })

  it('si el repositorio falla responde motivo fallo', async () => {
    expect(await registrarCuenta(roto, completos())).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
  })
})

describe('iniciarSesion', () => {
  beforeEach(async () => {
    MockCuentaRepository.vaciar()
    await registrarCuenta(new MockCuentaRepository(), completos())
  })

  it('entra con el correo y la contraseña correctos (sin importar mayúsculas del correo)', async () => {
    expect(await iniciarSesion(new MockCuentaRepository(), { correo: ' ANA@correo.com ', clave: 'Clave-segura-9' })).toEqual({ ok: true, correo: 'ana@correo.com' })
  })

  it('con una contraseña mal o una cuenta que no existe responde lo mismo', async () => {
    const mala = await iniciarSesion(new MockCuentaRepository(), { correo: 'ana@correo.com', clave: 'Otra-clave-1' })
    const inexistente = await iniciarSesion(new MockCuentaRepository(), { correo: 'nadie@correo.com', clave: 'Clave-segura-9' })
    expect(mala).toEqual({ ok: false, errores: {}, motivo: 'credenciales' })
    expect(inexistente).toEqual(mala)
  })

  it('pide los datos que faltan sin consultar nada', async () => {
    expect(await iniciarSesion(roto, { correo: '', clave: '' })).toEqual({ ok: false, errores: { correo: 'obligatorio', clave: 'obligatorio' } })
  })

  it('si el repositorio falla responde motivo fallo', async () => {
    expect(await iniciarSesion(roto, { correo: 'ana@correo.com', clave: 'x' })).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
  })
})

describe('continuarConGoogle', () => {
  beforeEach(() => MockCuentaRepository.vaciar())

  it('entra con la identidad de Google y crea la cuenta la primera vez', async () => {
    expect(await continuarConGoogle(new MockCuentaRepository(), 'credencial')).toEqual({ ok: true, correo: CORREO_GOOGLE_SIMULADO })
    expect(MockCuentaRepository.cantidad()).toBe(1)
  })

  it('la segunda vez entra a la misma cuenta, sin duplicarla', async () => {
    const repositorio = new MockCuentaRepository()
    await continuarConGoogle(repositorio, 'credencial')
    await continuarConGoogle(repositorio, 'otra')
    expect(MockCuentaRepository.cantidad()).toBe(1)
  })

  it('una cuenta que solo existe por Google no deja entrar con contraseña', async () => {
    await continuarConGoogle(new MockCuentaRepository(), 'credencial')
    const resultado = await iniciarSesion(new MockCuentaRepository(), { correo: CORREO_GOOGLE_SIMULADO, clave: 'cualquier-clave-1' })
    expect(resultado).toEqual({ ok: false, errores: {}, motivo: 'credenciales' })
  })

  it('rechaza una credencial vacía y responde fallo si el repositorio falla', async () => {
    expect(await continuarConGoogle(new MockCuentaRepository(), '  ')).toEqual({ ok: false, motivo: 'rechazada' })
    expect(await continuarConGoogle(roto, 'credencial')).toEqual({ ok: false, motivo: 'fallo' })
  })
})

describe('reenviarConfirmacion', () => {
  it('responde ok con un correo válido, tenga o no cuenta', async () => {
    expect(await reenviarConfirmacion(new MockCuentaRepository(), 'nadie@correo.com')).toEqual({ ok: true })
  })
  it('rechaza un correo inválido y responde fallo si el repositorio falla', async () => {
    expect(await reenviarConfirmacion(new MockCuentaRepository(), 'no-es-correo')).toEqual({ ok: false, motivo: 'fallo' })
    expect(await reenviarConfirmacion(roto, 'ana@correo.com')).toEqual({ ok: false, motivo: 'fallo' })
  })
})
