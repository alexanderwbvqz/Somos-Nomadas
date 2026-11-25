import { beforeEach, describe, expect, it } from 'vitest'
import type { CuentaRepository } from '../domain/CuentaRepository'
import type { AlmacenDeSesion, CredencialDeSesion } from '../domain/sesion'
import { ErrorDeLimite } from '../domain/errores'
import { MockAlmacenDeSesion } from '../infrastructure/mock/MockAlmacenDeSesion'
import { MockCuentaRepository } from '../infrastructure/mock/MockCuentaRepository'
import { cerrarSesion } from './cerrarSesion'
import { iniciarSesion } from './iniciarSesion'
import { obtenerCuentaActual } from './obtenerCuentaActual'
import { renovarSesion } from './renovarSesion'

const cuenta = { correo: 'ana@correo.com', clave: 'Clave-segura-9', aceptaPolitica: true } as const
const datos = { correo: cuenta.correo, clave: cuenta.clave }

async function conCuenta() {
  const repositorio = new MockCuentaRepository()
  await repositorio.registrar(cuenta)
  return repositorio
}

const noDebiaLlamarse = async (): Promise<never> => {
  throw new Error('no debía llamarse')
}

function repositorioQue(cambios: Partial<CuentaRepository>): CuentaRepository {
  return {
    registrar: noDebiaLlamarse,
    iniciarSesion: noDebiaLlamarse,
    iniciarConGoogle: noDebiaLlamarse,
    reenviarConfirmacion: noDebiaLlamarse,
    renovarSesion: noDebiaLlamarse,
    cerrarSesion: noDebiaLlamarse,
    obtenerCuenta: noDebiaLlamarse,
    confirmarCorreo: noDebiaLlamarse,
    ...cambios,
  }
}

beforeEach(() => MockCuentaRepository.vaciar())

describe('iniciarSesion: la sesión se guarda en el servidor, no se devuelve', () => {
  it('al entrar guarda la credencial en el almacén y devuelve solo el correo', async () => {
    const almacen = new MockAlmacenDeSesion()

    const resultado = await iniciarSesion(await conCuenta(), almacen, datos)

    expect(resultado).toEqual({ ok: true, correo: 'ana@correo.com' })
    expect(almacen.guardada.acceso).toBeTruthy()
    expect(almacen.guardada.renovacion).toBeTruthy()
    // Lo que se devuelve puede llegar al navegador: no puede llevar ningún token
    const texto = JSON.stringify(resultado)
    expect(texto).not.toContain(almacen.guardada.acceso ?? 'x')
    expect(texto).not.toContain(almacen.guardada.renovacion ?? 'x')
  })

  it.each([
    ['clave incorrecta', { ...datos, clave: 'Otra-clave-1' }],
    ['datos vacíos', { correo: '', clave: '' }],
  ])('con %s no guarda nada', async (_nombre, entrada) => {
    const almacen = new MockAlmacenDeSesion()

    await iniciarSesion(await conCuenta(), almacen, entrada)

    expect(almacen.guardados).toBe(0)
  })

  it('si el repositorio falla no guarda nada', async () => {
    const almacen = new MockAlmacenDeSesion()
    const repositorio = repositorioQue({
      iniciarSesion: async () => {
        throw new ErrorDeLimite()
      },
    })

    expect(await iniciarSesion(repositorio, almacen, datos)).toEqual({ ok: false, errores: {}, motivo: 'limite' })
    expect(almacen.guardados).toBe(0)
  })

  it('si no se puede guardar la sesión responde fallo', async () => {
    const almacen: AlmacenDeSesion = {
      leer: async () => ({}),
      guardar: async () => {
        throw new Error('cookies bloqueadas')
      },
      borrar: async () => undefined,
    }

    expect(await iniciarSesion(await conCuenta(), almacen, datos)).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
  })
})

describe('cerrarSesion', () => {
  it('avisa al backend con la renovación y borra la sesión guardada', async () => {
    const cerradas: string[] = []
    const almacen = new MockAlmacenDeSesion({ acceso: 'a', renovacion: 'r1' })
    const repositorio = repositorioQue({ cerrarSesion: async (renovacion) => void cerradas.push(renovacion) })

    await cerrarSesion(repositorio, almacen)

    expect(cerradas).toEqual(['r1'])
    expect(almacen.guardada).toEqual({})
  })

  it('aunque el backend no responda borra la sesión de aquí: salir siempre funciona', async () => {
    const almacen = new MockAlmacenDeSesion({ acceso: 'a', renovacion: 'r1' })
    const repositorio = repositorioQue({
      cerrarSesion: async () => {
        throw new Error('sin conexión')
      },
    })

    await expect(cerrarSesion(repositorio, almacen)).resolves.toBeUndefined()

    expect(almacen.guardada).toEqual({})
  })

  it('sin renovación guardada no llama al backend, pero limpia lo que haya', async () => {
    const almacen = new MockAlmacenDeSesion({ acceso: 'a' })
    const llamadas: string[] = []

    await cerrarSesion(repositorioQue({ cerrarSesion: async (renovacion) => void llamadas.push(renovacion) }), almacen)

    expect(llamadas).toEqual([])
    expect(almacen.guardada).toEqual({})
  })

  it('con el repositorio simulado, el acceso y la renovación dejan de servir', async () => {
    const repositorio = await conCuenta()
    const almacen = new MockAlmacenDeSesion()
    await iniciarSesion(repositorio, almacen, datos)
    const { acceso, renovacion } = almacen.guardada

    await cerrarSesion(repositorio, almacen)

    expect(await repositorio.obtenerCuenta(acceso ?? '')).toBeUndefined()
    expect(await repositorio.renovarSesion(renovacion ?? '')).toBeUndefined()
  })
})

describe('obtenerCuentaActual', () => {
  it('con una sesión abierta devuelve quién es', async () => {
    const repositorio = await conCuenta()
    const almacen = new MockAlmacenDeSesion()
    await iniciarSesion(repositorio, almacen, datos)

    expect(await obtenerCuentaActual(repositorio, almacen)).toMatchObject({ correo: 'ana@correo.com' })
  })

  it('sin acceso guardado no pregunta al backend: no hay sesión', async () => {
    expect(await obtenerCuentaActual(repositorioQue({}), new MockAlmacenDeSesion({ renovacion: 'r' }))).toBeUndefined()
    expect(await obtenerCuentaActual(repositorioQue({}), new MockAlmacenDeSesion())).toBeUndefined()
  })

  it('con un acceso que el backend no reconoce devuelve undefined', async () => {
    const almacen = new MockAlmacenDeSesion({ acceso: 'falso', renovacion: 'r' })

    expect(await obtenerCuentaActual(await conCuenta(), almacen)).toBeUndefined()
  })

  it('si el backend falla, el error sale: no se confunde una caída con «nadie ha entrado»', async () => {
    const repositorio = repositorioQue({
      obtenerCuenta: async () => {
        throw new Error('caído')
      },
    })

    await expect(obtenerCuentaActual(repositorio, new MockAlmacenDeSesion({ acceso: 'a' }))).rejects.toThrow('caído')
  })
})

describe('renovarSesion', () => {
  const vieja: CredencialDeSesion = { acceso: 'a', renovacion: 'r', expiraEnSegundos: 900 }

  it('con una renovación que vale devuelve la credencial nueva', async () => {
    const repositorio = await conCuenta()
    const almacen = new MockAlmacenDeSesion()
    await iniciarSesion(repositorio, almacen, datos)

    const resultado = await renovarSesion(repositorio, almacen.guardada.renovacion ?? '')

    expect(resultado.estado).toBe('renovada')
    if (resultado.estado === 'renovada') expect(resultado.credencial.renovacion).not.toBe(almacen.guardada.renovacion)
  })

  it('si el backend la rechaza, la sesión terminó', async () => {
    const repositorio = repositorioQue({ renovarSesion: async () => undefined })

    expect(await renovarSesion(repositorio, vieja.renovacion)).toEqual({ estado: 'rechazada' })
  })

  it('si el backend no responde, no es un rechazo: la sesión sigue y se reintenta luego', async () => {
    const repositorio = repositorioQue({
      renovarSesion: async () => {
        throw new Error('sin conexión')
      },
    })

    expect(await renovarSesion(repositorio, vieja.renovacion)).toEqual({ estado: 'sin_respuesta' })
  })
})
