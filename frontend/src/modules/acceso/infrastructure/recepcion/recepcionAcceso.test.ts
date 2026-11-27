import { beforeEach, describe, expect, it } from 'vitest'
import type { CuentaRepository } from '../../domain/CuentaRepository'
import { datosRegistroVacios } from '../../domain/cuenta'
import { MockAlmacenDeSesion } from '../mock/MockAlmacenDeSesion'
import { MockMarcaNavegador } from '../mock/MockMarcaNavegador'
import { CORREO_GOOGLE_SIMULADO, MockCuentaRepository } from '../mock/MockCuentaRepository'
import { recibirConfirmacion, recibirGoogle, recibirInicioSesion, recibirRegistro, recibirReenvio } from './recepcionAcceso'

const validos = { ...datosRegistroVacios(), correo: 'ana@correo.com', clave: 'Clave-segura-9', aceptaPolitica: true }

describe('recepcionAcceso', () => {
  beforeEach(() => MockCuentaRepository.vaciar())

  it('registra y luego deja iniciar sesión', async () => {
    expect(await recibirRegistro(new MockCuentaRepository(), validos, 'es')).toEqual({ ok: true, correo: 'ana@correo.com' })
    expect(await recibirInicioSesion(new MockCuentaRepository(), new MockAlmacenDeSesion(), { correo: 'ana@correo.com', clave: 'Clave-segura-9' })).toEqual({ ok: true, correo: 'ana@correo.com' })
  })

  it('entra con Google', async () => {
    expect(await recibirGoogle(new MockCuentaRepository(), 'credencial', 'c-google')).toEqual({ ok: true, correo: CORREO_GOOGLE_SIMULADO })
  })

  it('rechaza lo que no tiene la forma esperada', async () => {
    expect(await recibirRegistro(new MockCuentaRepository(), { cualquier: 'cosa' }, 'es')).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
    expect(await recibirInicioSesion(new MockCuentaRepository(), new MockAlmacenDeSesion(), 'hola')).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
    expect(await recibirGoogle(new MockCuentaRepository(), { token: 1 }, 'c-forma')).toEqual({ ok: false, motivo: 'rechazada' })
    expect(await recibirReenvio(new MockCuentaRepository(), 42, 'es')).toEqual({ ok: false, motivo: 'fallo' })
    expect(await recibirConfirmacion(new MockCuentaRepository(), { token: 'x' })).toEqual({ ok: false, motivo: 'invalido' })
  })

  it('devuelve los errores de validación del servidor', async () => {
    const resultado = await recibirRegistro(new MockCuentaRepository(), { ...validos, correo: 'mal' }, 'es')
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) expect(resultado.errores.correo).toBe('correoInvalido')
  })

  it('al iniciar sesión guarda la sesión en el almacén y no devuelve ningún token', async () => {
    await recibirRegistro(new MockCuentaRepository(), validos, 'es')
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

  it('el registro y el reenvío llevan el idioma al repositorio; uno desconocido se cambia por español', async () => {
    const idiomas: string[] = []
    const repositorio: CuentaRepository = new MockCuentaRepository()
    const espiado: CuentaRepository = {
      ...repositorio,
      registrar: async (cuenta, idioma) => {
        idiomas.push(idioma)
        return repositorio.registrar(cuenta, idioma)
      },
      reenviarConfirmacion: async (correo, idioma) => {
        idiomas.push(idioma)
        return repositorio.reenviarConfirmacion(correo, idioma)
      },
    }

    await recibirRegistro(espiado, validos, 'pt')
    await recibirRegistro(espiado, { ...validos, correo: 'otra@correo.com' }, 'fr')
    await recibirReenvio(espiado, 'ana@correo.com', 'en')
    await recibirReenvio(espiado, 'ana@correo.com', undefined)

    expect(idiomas).toEqual(['pt', 'es', 'en', 'es'])
  })

  it('confirma con el token del enlace', async () => {
    await recibirRegistro(new MockCuentaRepository(), validos, 'es')
    const token = MockCuentaRepository.ultimoToken()

    expect(await recibirConfirmacion(new MockCuentaRepository(), token)).toEqual({ ok: true, correo: 'ana@correo.com', dentro: false })
  })

  it('el mismo navegador que se registró confirma y queda dentro, con la sesión guardada en el almacén', async () => {
    const marca = new MockMarcaNavegador()
    await recibirRegistro(new MockCuentaRepository(), validos, 'es', marca)
    const almacen = new MockAlmacenDeSesion()

    const resultado = await recibirConfirmacion(new MockCuentaRepository(), MockCuentaRepository.ultimoToken(), marca, almacen)

    expect(resultado).toEqual({ ok: true, correo: 'ana@correo.com', dentro: true })
    expect(almacen.guardada.renovacion).toBeDefined()
    expect(marca.valor).toBeUndefined()
  })

  it('otro navegador solo confirma', async () => {
    await recibirRegistro(new MockCuentaRepository(), validos, 'es', new MockMarcaNavegador())
    const almacen = new MockAlmacenDeSesion()

    const resultado = await recibirConfirmacion(new MockCuentaRepository(), MockCuentaRepository.ultimoToken(), new MockMarcaNavegador(), almacen)

    expect(resultado).toEqual({ ok: true, correo: 'ana@correo.com', dentro: false })
    expect(almacen.guardados).toBe(0)
  })

  it('el enlace reenviado queda atado al navegador que lo pidió', async () => {
    await recibirRegistro(new MockCuentaRepository(), validos, 'es', new MockMarcaNavegador())
    const otro = new MockMarcaNavegador()
    await recibirReenvio(new MockCuentaRepository(), 'ana@correo.com', 'es', otro)

    const resultado = await recibirConfirmacion(new MockCuentaRepository(), MockCuentaRepository.ultimoToken(), otro, new MockAlmacenDeSesion())

    expect(resultado).toMatchObject({ ok: true, dentro: true })
  })

  it.each([undefined, null, 42, '', 'a'.repeat(501), { token: 'x' }])(
    'un token que no es un texto razonable (%j) es un enlace inválido',
    async (entrada) => {
      expect(await recibirConfirmacion(new MockCuentaRepository(), entrada)).toEqual({ ok: false, motivo: 'invalido' })
    },
  )

  it('el reenvío ya no se limita aquí: lo limita el backend por correo y por persona', async () => {
    await recibirRegistro(new MockCuentaRepository(), validos, 'es')
    const resultados = []
    for (let i = 0; i < 6; i++) resultados.push(await recibirReenvio(new MockCuentaRepository(), 'ana@correo.com', 'es'))

    expect(resultados.every((r) => r.ok)).toBe(true)
  })
})
