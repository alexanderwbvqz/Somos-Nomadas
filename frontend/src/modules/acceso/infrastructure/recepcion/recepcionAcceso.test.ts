import { beforeEach, describe, expect, it } from 'vitest'
import { datosRegistroVacios } from '../../domain/cuenta'
import { MockAlmacenDeSesion } from '../mock/MockAlmacenDeSesion'
import { CORREO_GOOGLE_SIMULADO, MockCuentaRepository } from '../mock/MockCuentaRepository'
import { recibirGoogle, recibirInicioSesion, recibirRegistro, recibirReenvio } from './recepcionAcceso'

const validos = { ...datosRegistroVacios(), correo: 'ana@correo.com', clave: 'Clave-segura-9', aceptaPolitica: true }

describe('recepcionAcceso', () => {
  beforeEach(() => MockCuentaRepository.vaciar())

  it('registra y luego deja iniciar sesión', async () => {
    expect(await recibirRegistro(new MockCuentaRepository(), validos)).toEqual({ ok: true, correo: 'ana@correo.com' })
    expect(await recibirInicioSesion(new MockCuentaRepository(), new MockAlmacenDeSesion(), { correo: 'ana@correo.com', clave: 'Clave-segura-9' })).toEqual({ ok: true, correo: 'ana@correo.com' })
  })

  it('entra con Google', async () => {
    expect(await recibirGoogle(new MockCuentaRepository(), 'credencial', 'c-google')).toEqual({ ok: true, correo: CORREO_GOOGLE_SIMULADO })
  })

  it('rechaza lo que no tiene la forma esperada', async () => {
    expect(await recibirRegistro(new MockCuentaRepository(), { cualquier: 'cosa' })).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
    expect(await recibirInicioSesion(new MockCuentaRepository(), new MockAlmacenDeSesion(), 'hola')).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
    expect(await recibirGoogle(new MockCuentaRepository(), { token: 1 }, 'c-forma')).toEqual({ ok: false, motivo: 'rechazada' })
    expect(await recibirReenvio(new MockCuentaRepository(), 42, 'c-forma')).toEqual({ ok: false, motivo: 'fallo' })
  })

  it('devuelve los errores de validación del servidor', async () => {
    const resultado = await recibirRegistro(new MockCuentaRepository(), { ...validos, correo: 'mal' })
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) expect(resultado.errores.correo).toBe('correoInvalido')
  })

  it('al iniciar sesión guarda la sesión en el almacén y no devuelve ningún token', async () => {
    await recibirRegistro(new MockCuentaRepository(), validos)
    const almacen = new MockAlmacenDeSesion()

    const resultado = await recibirInicioSesion(new MockCuentaRepository(), almacen, { correo: 'ana@correo.com', clave: 'Clave-segura-9' })

    expect(Object.keys(resultado)).toEqual(['ok', 'correo'])
    expect(almacen.guardada.renovacion).toBeTruthy()
  })

  it('con un cuerpo que no es de inicio de sesión no guarda nada', async () => {
    const almacen = new MockAlmacenDeSesion()

    await recibirInicioSesion(new MockCuentaRepository(), almacen, { correo: 1 })

    expect(almacen.guardados).toBe(0)
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
