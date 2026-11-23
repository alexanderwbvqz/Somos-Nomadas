import { beforeEach, describe, expect, it } from 'vitest'
import { datosHistoriasVacios } from '../domain/historias'
import type { RespuestasRepository } from '../domain/RespuestasRepository'
import { MockRespuestasRepository } from '../infrastructure/mock/MockRespuestasRepository'
import { guardarForma, guardarHistorias, guardarProfundizacion, guardarTareas, obtenerRespuestas, prepararCierre } from './respuestas'

const roto: RespuestasRepository = {
  guardarMarcas: async () => { throw new Error('x') },
  guardarProfundizacion: async () => { throw new Error('x') },
  guardarHistorias: async () => { throw new Error('x') },
  guardarForma: async () => { throw new Error('x') },
  obtener: async () => { throw new Error('x') },
}

const marcas = { desarrolloWeb: 'esMiTrabajo', ventas: 'variasVeces', marketingDigital: 'variasVeces', finanzasContabilidad: 'unaVez' } as const

describe('guardarTareas', () => {
  beforeEach(() => MockRespuestasRepository.vaciar())

  it('guarda las tareas marcadas', async () => {
    const repositorio = new MockRespuestasRepository()
    expect(await guardarTareas(repositorio, { ...marcas })).toEqual({ ok: true })
    expect((await obtenerRespuestas(repositorio)).marcas).toEqual(marcas)
  })

  it('cada guardado sustituye al anterior', async () => {
    const repositorio = new MockRespuestasRepository()
    await guardarTareas(repositorio, { ...marcas })
    await guardarTareas(repositorio, { ventas: 'unaVez' })
    expect((await obtenerRespuestas(repositorio)).marcas).toEqual({ ventas: 'unaVez' })
  })

  it('si el repositorio falla, avisa con "fallo"', async () => {
    expect(await guardarTareas(roto, { ...marcas })).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
  })
})

describe('guardarProfundizacion', () => {
  beforeEach(() => MockRespuestasRepository.vaciar())

  async function conTareas() {
    const repositorio = new MockRespuestasRepository()
    await guardarTareas(repositorio, { ...marcas })
    return repositorio
  }

  it('guarda lo que cuenta de una de sus habilidades más fuertes', async () => {
    const repositorio = await conTareas()
    expect(await guardarProfundizacion(repositorio, 'desarrolloWeb', { tecnologias: ['react'], tiempo: 'masDeCincoAnos' })).toEqual({ ok: true })
    expect((await obtenerRespuestas(repositorio)).profundizacion.desarrolloWeb).toEqual({ tecnologias: ['react'], tiempo: 'masDeCincoAnos' })
  })

  it('no admite una habilidad que no es de las más fuertes, y no guarda nada', async () => {
    const repositorio = await conTareas()
    // finanzasContabilidad es la cuarta
    expect(await guardarProfundizacion(repositorio, 'finanzasContabilidad', { tiempo: 'unoATresAnos' })).toEqual({ ok: false, errores: { habilidad: 'noEsFuerte' } })
    expect((await obtenerRespuestas(repositorio)).profundizacion).toEqual({})
  })

  it('no admite una habilidad si no marcó ninguna tarea', async () => {
    expect(await guardarProfundizacion(new MockRespuestasRepository(), 'ventas', {})).toEqual({ ok: false, errores: { habilidad: 'noEsFuerte' } })
  })

  it('señala las respuestas que no valen y no guarda nada', async () => {
    const repositorio = await conTareas()
    const resultado = await guardarProfundizacion(repositorio, 'ventas', { aQuien: 'marcianos', tecnologias: ['react'] })
    expect(resultado).toEqual({ ok: false, errores: { preguntas: { aQuien: 'respuestaInvalida', tecnologias: 'preguntaDesconocida' } } })
    expect((await obtenerRespuestas(repositorio)).profundizacion).toEqual({})
  })

  it('volver a contar una habilidad sustituye lo anterior y no toca las otras', async () => {
    const repositorio = await conTareas()
    await guardarProfundizacion(repositorio, 'ventas', { tiempo: 'unoATresAnos' })
    await guardarProfundizacion(repositorio, 'desarrolloWeb', { tiempo: 'masDeCincoAnos' })
    await guardarProfundizacion(repositorio, 'ventas', { tiempo: 'masDeCincoAnos' })
    const { profundizacion } = await obtenerRespuestas(repositorio)
    expect(profundizacion.ventas).toEqual({ tiempo: 'masDeCincoAnos' })
    expect(profundizacion.desarrolloWeb).toEqual({ tiempo: 'masDeCincoAnos' })
  })

  it('si el repositorio falla, avisa con "fallo"', async () => {
    expect(await guardarProfundizacion(roto, 'ventas', {})).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
  })
})

describe('guardarHistorias', () => {
  beforeEach(() => MockRespuestasRepository.vaciar())

  it('guarda lo escrito, limpio, cuando hay permiso', async () => {
    const repositorio = new MockRespuestasRepository()
    const resultado = await guardarHistorias(repositorio, { ...datosHistoriasVacios(), logro: '  Armé una tienda ', sectores: ['moda', 'salud'], aceptaMostrar: true })
    expect(resultado).toEqual({ ok: true })
    expect((await obtenerRespuestas(repositorio)).historias).toMatchObject({ logro: 'Armé una tienda', sectores: ['salud', 'moda'] })
  })

  it('sin el permiso no guarda nada y lo dice', async () => {
    const repositorio = new MockRespuestasRepository()
    const resultado = await guardarHistorias(repositorio, { ...datosHistoriasVacios(), logro: 'Armé una tienda' })
    expect(resultado).toEqual({ ok: false, errores: { aceptaMostrar: 'faltaPermiso' } })
    expect((await obtenerRespuestas(repositorio)).historias).toBeUndefined()
  })

  it('si el repositorio falla, avisa con "fallo"', async () => {
    expect(await guardarHistorias(roto, datosHistoriasVacios())).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
  })
})

describe('guardarForma', () => {
  beforeEach(() => MockRespuestasRepository.vaciar())

  it('guarda las respuestas, el perfil que busca y el socio ideal', async () => {
    const repositorio = new MockRespuestasRepository()
    const resultado = await guardarForma(repositorio, { respuestas: { dedicacion: 'de10a20' }, busca: ['finanzas'], socioIdeal: ' Alguien ' })
    expect(resultado).toEqual({ ok: true })
    expect((await obtenerRespuestas(repositorio)).forma).toEqual({ respuestas: { dedicacion: 'de10a20' }, busca: ['finanzas'], socioIdeal: 'Alguien' })
  })

  it('una respuesta que no es posible no se guarda', async () => {
    const repositorio = new MockRespuestasRepository()
    const resultado = await guardarForma(repositorio, { respuestas: { dedicacion: 'remota' }, busca: [], socioIdeal: '' })
    expect(resultado).toEqual({ ok: false, errores: { respuestas: 'respuestaInvalida' } })
    expect((await obtenerRespuestas(repositorio)).forma).toBeUndefined()
  })

  it('si el repositorio falla, avisa con "fallo"', async () => {
    expect(await guardarForma(roto, { respuestas: {}, busca: [], socioIdeal: '' })).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
  })
})

describe('obtenerRespuestas', () => {
  beforeEach(() => MockRespuestasRepository.vaciar())

  it('sin nada guardado devuelve todo vacío', async () => {
    expect(await obtenerRespuestas(new MockRespuestasRepository())).toEqual({ marcas: {}, profundizacion: {} })
  })

  it('si no se puede leer, devuelve todo vacío en vez de romper', async () => {
    expect(await obtenerRespuestas(roto)).toEqual({ marcas: {}, profundizacion: {} })
  })

  it('devuelve una copia: cambiarla no cambia lo guardado', async () => {
    const repositorio = new MockRespuestasRepository()
    await guardarTareas(repositorio, { ventas: 'unaVez' })
    const lectura = await obtenerRespuestas(repositorio)
    lectura.marcas.ventas = 'esMiTrabajo'
    expect((await obtenerRespuestas(repositorio)).marcas.ventas).toBe('unaVez')
  })
})

describe('prepararCierre', () => {
  beforeEach(() => MockRespuestasRepository.vaciar())

  it('calcula las habilidades y el área de lo contado', async () => {
    const repositorio = new MockRespuestasRepository()
    await guardarTareas(repositorio, { ...marcas })
    await guardarProfundizacion(repositorio, 'desarrolloWeb', { tiempo: 'masDeCincoAnos' })
    const resultado = await prepararCierre(repositorio)
    expect(resultado.ok).toBe(true)
    if (resultado.ok) {
      expect(resultado.perfil.habilidades[0]).toMatchObject({ habilidad: 'desarrolloWeb', puntos: 5 })
      expect(resultado.perfil.area?.areas).toEqual(['tecnologia'])
    }
  })

  it('si cambia las tareas, lo contado de lo que ya no es fuerte deja de contar', async () => {
    const repositorio = new MockRespuestasRepository()
    await guardarTareas(repositorio, { ...marcas })
    await guardarProfundizacion(repositorio, 'desarrolloWeb', { tiempo: 'masDeCincoAnos' })
    await guardarTareas(repositorio, { desarrolloWeb: 'unaVez', ventas: 'esMiTrabajo', marketingDigital: 'esMiTrabajo', alianzas: 'esMiTrabajo' })
    const resultado = await prepararCierre(repositorio)
    expect(resultado.ok && resultado.perfil.habilidades.find((h) => h.habilidad === 'desarrolloWeb')).toMatchObject({ puntos: 1, estimado: true })
  })

  it('sin tareas no hay área, pero tampoco error', async () => {
    const resultado = await prepararCierre(new MockRespuestasRepository())
    expect(resultado).toEqual({ ok: true, perfil: { habilidades: [], area: undefined } })
  })

  it('si el repositorio falla, avisa con "fallo"', async () => {
    expect(await prepararCierre(roto)).toEqual({ ok: false, motivo: 'fallo' })
  })
})
