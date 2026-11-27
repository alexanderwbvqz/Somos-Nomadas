// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest'
import type { CuentaRepository } from '../../domain/CuentaRepository'
import { MockCuentaRepository } from './MockCuentaRepository'

const cuenta = { correo: 'ana@correo.com', clave: 'Clave-segura-9', aceptaPolitica: true } as const

async function conSesion() {
  const repositorio: CuentaRepository = new MockCuentaRepository()
  await repositorio.registrar(cuenta, 'es')
  const entrada = await repositorio.iniciarSesion(cuenta.correo, cuenta.clave)
  if (!entrada) throw new Error('Debía entrar')
  return { repositorio, credencial: entrada.credencial }
}

beforeEach(() => MockCuentaRepository.vaciar())

describe('MockCuentaRepository: sesiones', () => {
  it('al entrar entrega una credencial; con la clave mala, nada', async () => {
    const { credencial } = await conSesion()

    expect(credencial.acceso).not.toBe('')
    expect(credencial.renovacion).not.toBe('')
    expect(credencial.expiraEnSegundos).toBeGreaterThan(0)
    expect(await new MockCuentaRepository().iniciarSesion(cuenta.correo, 'otra')).toBeUndefined()
  })

  it('cada sesión tiene credenciales distintas', async () => {
    const { repositorio, credencial } = await conSesion()
    const otra = await repositorio.iniciarSesion(cuenta.correo, cuenta.clave)

    expect(otra?.credencial.acceso).not.toBe(credencial.acceso)
    expect(otra?.credencial.renovacion).not.toBe(credencial.renovacion)
  })

  it('con el acceso se sabe quién es la persona; con uno falso, no', async () => {
    const { repositorio, credencial } = await conSesion()

    expect(await repositorio.obtenerCuenta(credencial.acceso)).toMatchObject({ correo: 'ana@correo.com', correoConfirmado: true })
    expect(await repositorio.obtenerCuenta('inventado')).toBeUndefined()
  })

  it('renovar da una credencial nueva y deja inservible la anterior', async () => {
    const { repositorio, credencial } = await conSesion()

    const nueva = await repositorio.renovarSesion(credencial.renovacion)

    expect(nueva).toBeDefined()
    expect(nueva?.renovacion).not.toBe(credencial.renovacion)
    expect(await repositorio.renovarSesion(credencial.renovacion)).toBeUndefined()
    expect(await repositorio.obtenerCuenta(credencial.acceso)).toBeUndefined()
    expect(await repositorio.obtenerCuenta(nueva?.acceso ?? '')).toBeDefined()
  })

  it('no se renueva con una renovación inventada', async () => {
    expect(await new MockCuentaRepository().renovarSesion('inventada')).toBeUndefined()
  })

  it('cerrar la sesión la deja sin acceso ni renovación, y cerrar dos veces no falla', async () => {
    const { repositorio, credencial } = await conSesion()

    await repositorio.cerrarSesion(credencial.renovacion)
    await repositorio.cerrarSesion(credencial.renovacion)
    await repositorio.cerrarSesion('inventada')

    expect(await repositorio.obtenerCuenta(credencial.acceso)).toBeUndefined()
    expect(await repositorio.renovarSesion(credencial.renovacion)).toBeUndefined()
  })

  it('cerrar una sesión no cierra las demás de la misma cuenta', async () => {
    const { repositorio, credencial } = await conSesion()
    const otra = await repositorio.iniciarSesion(cuenta.correo, cuenta.clave)

    await repositorio.cerrarSesion(credencial.renovacion)

    expect(await repositorio.obtenerCuenta(otra?.credencial.acceso ?? '')).toBeDefined()
  })

})

describe('MockCuentaRepository: confirmación del correo', () => {
  it('al registrar una cuenta nueva guarda un enlace que la confirma una sola vez', async () => {
    const repositorio: CuentaRepository = new MockCuentaRepository()
    await repositorio.registrar(cuenta, 'es')
    const token = MockCuentaRepository.ultimoToken()

    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(await repositorio.confirmarCorreo(token ?? '')).toEqual({ correo: 'ana@correo.com' })
    expect(await repositorio.confirmarCorreo(token ?? '')).toBeUndefined()
  })

  it('en el navegador que pidió el enlace abre la sesión; en otro solo confirma', async () => {
    const repositorio: CuentaRepository = new MockCuentaRepository()
    await repositorio.registrar(cuenta, 'es', 'marca-del-portatil-0123456789')
    const primero = MockCuentaRepository.ultimoToken() ?? ''
    await repositorio.registrar({ ...cuenta, correo: 'luis@correo.com' }, 'es', 'marca-del-portatil-0123456789')
    const segundo = MockCuentaRepository.ultimoToken() ?? ''

    const mismo = await repositorio.confirmarCorreo(primero, 'marca-del-portatil-0123456789')
    const otro = await repositorio.confirmarCorreo(segundo, 'marca-del-movil-0123456789')

    expect(mismo?.credencial).toBeDefined()
    expect(await repositorio.obtenerCuenta(mismo?.credencial?.acceso ?? '')).toMatchObject({ correo: 'ana@correo.com' })
    expect(otro).toEqual({ correo: 'luis@correo.com' })
  })

  it('un correo ya registrado no genera otro enlace', async () => {
    const repositorio: CuentaRepository = new MockCuentaRepository()
    await repositorio.registrar(cuenta, 'es')
    const primero = MockCuentaRepository.ultimoToken()

    await repositorio.registrar(cuenta, 'es')

    expect(MockCuentaRepository.ultimoToken()).toBe(primero)
  })

  it('reenviar da un enlace nuevo y el anterior deja de valer; sin cuenta no hace nada', async () => {
    const repositorio: CuentaRepository = new MockCuentaRepository()
    await repositorio.registrar(cuenta, 'es')
    const anterior = MockCuentaRepository.ultimoToken() ?? ''

    await repositorio.reenviarConfirmacion('ana@correo.com', 'es')
    const nuevo = MockCuentaRepository.ultimoToken() ?? ''
    await repositorio.reenviarConfirmacion('nadie@correo.com', 'es')

    expect(nuevo).not.toBe(anterior)
    expect(MockCuentaRepository.ultimoToken()).toBe(nuevo)
    expect(await repositorio.confirmarCorreo(anterior)).toBeUndefined()
    expect(await repositorio.confirmarCorreo(nuevo)).toEqual({ correo: 'ana@correo.com' })
  })

  it('un token inventado no confirma nada', async () => {
    expect(await new MockCuentaRepository().confirmarCorreo('inventado-0123456789-abcdefg')).toBeUndefined()
  })
})
