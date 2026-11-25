import { beforeEach, describe, expect, it } from 'vitest'
import { datosRegistroVacios } from '../../domain/cuenta'
import { CORREO_GOOGLE_SIMULADO, MockCuentaRepository } from '../mock/MockCuentaRepository'
import { recibirGoogle, recibirInicioSesion, recibirRegistro, recibirReenvio } from './recepcionAcceso'

const validos = { ...datosRegistroVacios(), correo: 'ana@correo.com', clave: 'Clave-segura-9', aceptaPolitica: true }

describe('recepcionAcceso', () => {
  beforeEach(() => MockCuentaRepository.vaciar())

  it('registra y luego deja iniciar sesión', async () => {
    expect(await recibirRegistro(new MockCuentaRepository(), validos, 'c-flujo')).toEqual({ ok: true, correo: 'ana@correo.com' })
    expect(await recibirInicioSesion(new MockCuentaRepository(), { correo: 'ana@correo.com', clave: 'Clave-segura-9' }, 'c-flujo')).toEqual({ ok: true, correo: 'ana@correo.com' })
  })

  it('entra con Google', async () => {
    expect(await recibirGoogle(new MockCuentaRepository(), 'credencial', 'c-google')).toEqual({ ok: true, correo: CORREO_GOOGLE_SIMULADO })
  })

  it('rechaza lo que no tiene la forma esperada', async () => {
    expect(await recibirRegistro(new MockCuentaRepository(), { cualquier: 'cosa' }, 'c-forma')).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
    expect(await recibirInicioSesion(new MockCuentaRepository(), 'hola', 'c-forma')).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
    expect(await recibirGoogle(new MockCuentaRepository(), { token: 1 }, 'c-forma')).toEqual({ ok: false, motivo: 'rechazada' })
    expect(await recibirReenvio(new MockCuentaRepository(), 42, 'c-forma')).toEqual({ ok: false, motivo: 'fallo' })
  })

  it('devuelve los errores de validación del servidor', async () => {
    const resultado = await recibirRegistro(new MockCuentaRepository(), { ...validos, correo: 'mal' }, 'c-errores')
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) expect(resultado.errores.correo).toBe('correoInvalido')
  })

  it('limita los registros seguidos de un mismo cliente', async () => {
    const resultados = []
    for (let i = 0; i < 6; i++) resultados.push(await recibirRegistro(new MockCuentaRepository(), { ...validos, correo: `a${i}@correo.com` }, 'c-limite-registro'))
    expect(resultados.slice(0, 5).every((r) => r.ok)).toBe(true)
    expect(resultados[5]).toEqual({ ok: false, errores: {}, motivo: 'limite' })
    expect((await recibirRegistro(new MockCuentaRepository(), validos, 'otro-cliente')).ok).toBe(true)
  })

  it('limita los intentos de iniciar sesión, aunque la contraseña sea correcta', async () => {
    await recibirRegistro(new MockCuentaRepository(), validos, 'c-alta')
    for (let i = 0; i < 10; i++) await recibirInicioSesion(new MockCuentaRepository(), { correo: 'ana@correo.com', clave: 'Incorrecta-1' }, 'c-limite-sesion')
    expect(await recibirInicioSesion(new MockCuentaRepository(), { correo: 'ana@correo.com', clave: 'Clave-segura-9' }, 'c-limite-sesion')).toEqual({ ok: false, errores: {}, motivo: 'limite' })
  })

  it('limita los intentos con Google', async () => {
    for (let i = 0; i < 10; i++) await recibirGoogle(new MockCuentaRepository(), 'credencial', 'c-limite-google')
    expect(await recibirGoogle(new MockCuentaRepository(), 'credencial', 'c-limite-google')).toEqual({ ok: false, motivo: 'limite' })
  })

  it('limita los reenvíos por cliente y correo', async () => {
    const resultados = []
    for (let i = 0; i < 4; i++) resultados.push(await recibirReenvio(new MockCuentaRepository(), 'ana@correo.com', 'c-limite-reenvio'))
    expect(resultados.slice(0, 3).every((r) => r.ok)).toBe(true)
    expect(resultados[3]).toEqual({ ok: false, motivo: 'limite' })
    expect(await recibirReenvio(new MockCuentaRepository(), 'otra@correo.com', 'c-limite-reenvio')).toEqual({ ok: true })
  })
})
