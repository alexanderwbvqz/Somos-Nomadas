import { describe, expect, it } from 'vitest'
import type { CuentaRepository } from '../domain/CuentaRepository'
import type { MarcaDelNavegador } from '../domain/confirmacion'
import { datosRegistroVacios } from '../domain/cuenta'
import type { AlmacenDeSesion, CredencialDeSesion } from '../domain/sesion'
import { ErrorDeCamposInvalidos, ErrorDeLimite } from '../domain/errores'
import { confirmarCorreo } from './confirmarCorreo'
import { reenviarConfirmacion } from './reenviarConfirmacion'
import { registrarCuenta } from './registrarCuenta'

const TOKEN = 'kVmM4x6ra2TdRrgU23duyfSBxrvhOwiN71QK2GzTuZ8'

const MARCA = 'marca-del-navegador-0123456789'
const CREDENCIAL: CredencialDeSesion = { acceso: 'acceso-1', renovacion: 'renovacion-1', expiraEnSegundos: 900 }

/** Una marca en memoria: anota cuántas veces se crea, se lee y se borra */
function marcaQue(inicial?: string) {
  const marca = {
    valor: inicial,
    creadas: 0,
    borradas: 0,
    async crear() {
      marca.creadas += 1
      marca.valor = `${MARCA}-${marca.creadas}`
      return marca.valor
    },
    async leer() {
      return marca.valor
    },
    async borrar() {
      marca.borradas += 1
      marca.valor = undefined
    },
  }
  return marca satisfies MarcaDelNavegador
}

/** Un almacén de sesión en memoria */
function almacenQue({ falla = false } = {}) {
  const almacen = {
    guardadas: [] as CredencialDeSesion[],
    async leer() {
      return {}
    },
    async guardar(credencial: CredencialDeSesion) {
      if (falla) throw new Error('no se pudo escribir la cookie')
      almacen.guardadas.push(credencial)
    },
    async borrar() {},
  }
  return almacen satisfies AlmacenDeSesion
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

describe('confirmarCorreo', () => {
  it('con un token que el backend acepta devuelve el correo confirmado', async () => {
    const pedidos: unknown[][] = []
    const repositorio = repositorioQue({ confirmarCorreo: async (...args) => (pedidos.push(args), { correo: 'ana@correo.com' }) })

    expect(await confirmarCorreo(repositorio, TOKEN)).toEqual({ ok: true, correo: 'ana@correo.com', dentro: false })
    expect(pedidos).toEqual([[TOKEN, undefined]])
  })

  it('manda la marca de este navegador y, si el backend abre la sesión, la guarda y queda dentro', async () => {
    const pedidos: unknown[][] = []
    const repositorio = repositorioQue({
      confirmarCorreo: async (...args) => (pedidos.push(args), { correo: 'ana@correo.com', credencial: CREDENCIAL }),
    })
    const marca = marcaQue(MARCA)
    const almacen = almacenQue()

    const resultado = await confirmarCorreo(repositorio, TOKEN, { marca, almacen })

    expect(resultado).toEqual({ ok: true, correo: 'ana@correo.com', dentro: true })
    expect(pedidos).toEqual([[TOKEN, MARCA]])
    expect(almacen.guardadas).toEqual([CREDENCIAL])
    // La credencial no vuelve en el resultado, que sí llega al navegador
    expect(JSON.stringify(resultado)).not.toContain('renovacion-1')
    // La marca ya no sirve: el enlace se usó
    expect(marca.borradas).toBe(1)
  })

  it('en otro navegador el backend solo confirma: no se guarda ninguna sesión', async () => {
    const repositorio = repositorioQue({ confirmarCorreo: async () => ({ correo: 'ana@correo.com' }) })
    const almacen = almacenQue()

    const resultado = await confirmarCorreo(repositorio, TOKEN, { marca: marcaQue(MARCA), almacen })

    expect(resultado).toEqual({ ok: true, correo: 'ana@correo.com', dentro: false })
    expect(almacen.guardadas).toEqual([])
  })

  it('sin almacén donde guardarla no queda dentro, aunque el backend la abra', async () => {
    const repositorio = repositorioQue({ confirmarCorreo: async () => ({ correo: 'ana@correo.com', credencial: CREDENCIAL }) })

    expect(await confirmarCorreo(repositorio, TOKEN, { marca: marcaQue(MARCA) })).toEqual({ ok: true, correo: 'ana@correo.com', dentro: false })
  })

  it('si no se puede guardar la sesión, el correo igual queda confirmado: se entra con la contraseña', async () => {
    const repositorio = repositorioQue({ confirmarCorreo: async () => ({ correo: 'ana@correo.com', credencial: CREDENCIAL }) })

    const resultado = await confirmarCorreo(repositorio, TOKEN, { marca: marcaQue(MARCA), almacen: almacenQue({ falla: true }) })

    expect(resultado).toEqual({ ok: true, correo: 'ana@correo.com', dentro: false })
  })

  it('un enlace que no vale no borra la marca: puede llegar otro enlace para este navegador', async () => {
    const marca = marcaQue(MARCA)

    await confirmarCorreo(repositorioQue({ confirmarCorreo: async () => undefined }), TOKEN, { marca, almacen: almacenQue() })

    expect(marca.borradas).toBe(0)
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

  it('registrarCuenta crea una marca nueva para este navegador y la manda con el registro', async () => {
    const pedidos: unknown[][] = []
    const repositorio = repositorioQue({ registrar: async (...args) => void pedidos.push(args) })
    const marca = marcaQue()

    await registrarCuenta(repositorio, datos, 'es', marca)

    expect(marca.creadas).toBe(1)
    expect(pedidos).toEqual([[expect.objectContaining({ correo: 'ana@correo.com' }), 'es', `${MARCA}-1`]])
  })

  it('registrarCuenta no crea marca si los datos no valen ni si es un robot', async () => {
    const marca = marcaQue()

    await registrarCuenta(repositorioQue({}), { ...datos, correo: 'mal' }, 'es', marca)
    await registrarCuenta(repositorioQue({}), { ...datos, sitioSecundario: 'http://spam.com' }, 'es', marca)

    expect(marca.creadas).toBe(0)
  })

  it('reenviarConfirmacion crea una marca nueva: el enlace nuevo queda atado a este navegador', async () => {
    const pedidos: unknown[][] = []
    const repositorio = repositorioQue({ reenviarConfirmacion: async (...args) => void pedidos.push(args) })
    const marca = marcaQue('marca-vieja-0123456789-abcdef')

    await reenviarConfirmacion(repositorio, 'ana@correo.com', 'es', marca)
    await reenviarConfirmacion(repositorio, 'no-es-correo', 'es', marca)

    expect(marca.creadas).toBe(1)
    expect(pedidos).toEqual([['ana@correo.com', 'es', `${MARCA}-1`]])
  })

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
