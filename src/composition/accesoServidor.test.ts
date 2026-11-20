import { beforeEach, describe, expect, it } from 'vitest'
import { datosRegistroVacios } from '@/modules/acceso/domain/cuenta'
import { MockCuentaRepository } from '@/modules/acceso/infrastructure/mock/MockCuentaRepository'
import { iniciarSesionEnServidor, registrarEnServidor, reenviarEnServidor } from './accesoServidor'

const validos = { ...datosRegistroVacios(), nombre: 'Ana', apellidos: 'Pérez', pais: 'PE', correo: 'ana@correo.com', clave: 'clave-segura-9', aceptaPolitica: true }

describe('accesoServidor', () => {
  beforeEach(() => MockCuentaRepository.vaciar())

  it('registra y luego deja iniciar sesión', async () => {
    expect(await registrarEnServidor(validos, 'c-flujo')).toEqual({ ok: true, correo: 'ana@correo.com' })
    expect(await iniciarSesionEnServidor({ correo: 'ana@correo.com', clave: 'clave-segura-9' }, 'c-flujo')).toEqual({ ok: true, nombre: 'Ana' })
  })

  it('rechaza lo que no tiene la forma esperada', async () => {
    expect(await registrarEnServidor({ cualquier: 'cosa' }, 'c-forma')).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
    expect(await iniciarSesionEnServidor('hola', 'c-forma')).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
    expect(await reenviarEnServidor(42, 'c-forma')).toEqual({ ok: false, motivo: 'fallo' })
  })

  it('devuelve los errores de validación del servidor', async () => {
    const resultado = await registrarEnServidor({ ...validos, correo: 'mal' }, 'c-errores')
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) expect(resultado.errores.correo).toBe('correoInvalido')
  })

  it('limita los registros seguidos de un mismo cliente', async () => {
    const resultados = []
    for (let i = 0; i < 6; i++) resultados.push(await registrarEnServidor({ ...validos, correo: `a${i}@correo.com` }, 'c-limite-registro'))
    expect(resultados.slice(0, 5).every((r) => r.ok)).toBe(true)
    expect(resultados[5]).toEqual({ ok: false, errores: {}, motivo: 'limite' })
    expect((await registrarEnServidor(validos, 'otro-cliente')).ok).toBe(true)
  })

  it('limita los intentos de iniciar sesión, aunque la contraseña sea correcta', async () => {
    await registrarEnServidor(validos, 'c-alta')
    for (let i = 0; i < 10; i++) await iniciarSesionEnServidor({ correo: 'ana@correo.com', clave: 'incorrecta-1' }, 'c-limite-sesion')
    expect(await iniciarSesionEnServidor({ correo: 'ana@correo.com', clave: 'clave-segura-9' }, 'c-limite-sesion')).toEqual({ ok: false, errores: {}, motivo: 'limite' })
  })

  it('limita los reenvíos por cliente y correo', async () => {
    const resultados = []
    for (let i = 0; i < 4; i++) resultados.push(await reenviarEnServidor('ana@correo.com', 'c-limite-reenvio'))
    expect(resultados.slice(0, 3).every((r) => r.ok)).toBe(true)
    expect(resultados[3]).toEqual({ ok: false, motivo: 'limite' })
    expect(await reenviarEnServidor('otra@correo.com', 'c-limite-reenvio')).toEqual({ ok: true })
  })
})
