import { describe, expect, it } from 'vitest'
import type { CuentaRepository } from '../domain/CuentaRepository'
import { datosRegistroVacios } from '../domain/cuenta'
import { ErrorDeCamposInvalidos, ErrorDeLimite } from '../domain/errores'
import { confirmarCorreo } from './confirmarCorreo'
import { reenviarConfirmacion } from './reenviarConfirmacion'
import { registrarCuenta } from './registrarCuenta'

const TOKEN = 'kVmM4x6ra2TdRrgU23duyfSBxrvhOwiN71QK2GzTuZ8'

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

describe('confirmarCorreo', () => {
  it('con un token que el backend acepta devuelve el correo confirmado', async () => {
    const pedidos: string[] = []
    const repositorio = repositorioQue({ confirmarCorreo: async (token) => (pedidos.push(token), 'ana@correo.com') })

    expect(await confirmarCorreo(repositorio, TOKEN)).toEqual({ ok: true, correo: 'ana@correo.com' })
    expect(pedidos).toEqual([TOKEN])
  })

  it('si el backend no lo reconoce, el enlace es inválido', async () => {
    const repositorio = repositorioQue({ confirmarCorreo: async () => undefined })

    expect(await confirmarCorreo(repositorio, TOKEN)).toEqual({ ok: false, motivo: 'invalido' })
  })

  it.each(['', 'corto', 'con espacios aaaaaaaaaaaaaaaa', 'a'.repeat(201)])(
    'un token sin forma de token (%j) es inválido sin preguntar al backend',
    async (token) => {
      expect(await confirmarCorreo(repositorioQue({}), token)).toEqual({ ok: false, motivo: 'invalido' })
    },
  )

  it('demasiados intentos es motivo limite; cualquier otro error, fallo', async () => {
    const limite = repositorioQue({
      confirmarCorreo: async () => {
        throw new ErrorDeLimite(60)
      },
    })
    const caido = repositorioQue({
      confirmarCorreo: async () => {
        throw new Error('sin conexión')
      },
    })

    expect(await confirmarCorreo(limite, TOKEN)).toEqual({ ok: false, motivo: 'limite' })
    expect(await confirmarCorreo(caido, TOKEN)).toEqual({ ok: false, motivo: 'fallo' })
  })
})

describe('el idioma del correo', () => {
  const datos = { ...datosRegistroVacios(), correo: 'Ana@Correo.com', clave: 'Clave-segura-9', aceptaPolitica: true }

  it('registrarCuenta lo pasa al repositorio, y sin él el correo va en español', async () => {
    const idiomas: string[] = []
    const repositorio = repositorioQue({ registrar: async (_cuenta, idioma) => void idiomas.push(idioma) })

    await registrarCuenta(repositorio, datos, 'pt')
    await registrarCuenta(repositorio, datos)

    expect(idiomas).toEqual(['pt', 'es'])
  })

  it('reenviarConfirmacion lo pasa al repositorio con el correo normalizado', async () => {
    const pedidos: [string, string][] = []
    const repositorio = repositorioQue({ reenviarConfirmacion: async (correo, idioma) => void pedidos.push([correo, idioma]) })

    expect(await reenviarConfirmacion(repositorio, ' ANA@correo.com ', 'en')).toEqual({ ok: true })
    await reenviarConfirmacion(repositorio, 'ana@correo.com')

    expect(pedidos).toEqual([
      ['ana@correo.com', 'en'],
      ['ana@correo.com', 'es'],
    ])
  })

  it('reenviarConfirmacion: un correo que el backend rechaza es un fallo', async () => {
    const repositorio = repositorioQue({
      reenviarConfirmacion: async () => {
        throw new ErrorDeCamposInvalidos({ correo: 'correoInvalido' })
      },
    })

    expect(await reenviarConfirmacion(repositorio, 'ana@correo.com', 'es')).toEqual({ ok: false, motivo: 'fallo' })
  })
})
