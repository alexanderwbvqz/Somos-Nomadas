import { beforeEach, describe, expect, it } from 'vitest'
import { obtenerRespuestas } from '../../application/respuestas'
import { MockRespuestasRepository } from '../mock/MockRespuestasRepository'
import { recibirCierre, recibirForma, recibirHistorias, recibirProfundizacion, recibirTareas } from './recepcionRespuestas'

const malformado = { ok: false, errores: {}, motivo: 'fallo' }

describe('recepcionRespuestas', () => {
  beforeEach(() => MockRespuestasRepository.vaciar())

  it('recibe y guarda las tareas', async () => {
    const repositorio = new MockRespuestasRepository()
    expect(await recibirTareas(repositorio, { marcas: { ventas: 'unaVez' } }, 'cliente-tareas')).toEqual({ ok: true })
    expect((await obtenerRespuestas(repositorio)).marcas).toEqual({ ventas: 'unaVez' })
  })

  it('lo que no tiene la forma esperada responde "fallo" y no guarda nada', async () => {
    const repositorio = new MockRespuestasRepository()
    expect(await recibirTareas(repositorio, { marcas: { astrologia: 'unaVez' } }, 'cliente-forma')).toEqual(malformado)
    expect(await recibirHistorias(repositorio, { logro: 5 }, 'cliente-forma')).toEqual(malformado)
    expect(await recibirForma(repositorio, 'hola', 'cliente-forma')).toEqual(malformado)
    expect(await recibirProfundizacion(repositorio, undefined, 'cliente-forma')).toEqual(malformado)
    expect(await obtenerRespuestas(repositorio)).toEqual({ marcas: {}, profundizacion: {} })
  })

  it('la profundización pasa por las reglas del dominio: solo habilidades fuertes', async () => {
    const repositorio = new MockRespuestasRepository()
    await recibirTareas(repositorio, { marcas: { ventas: 'esMiTrabajo' } }, 'cliente-prof')
    expect(await recibirProfundizacion(repositorio, { habilidad: 'ventas', respuestas: { tiempo: 'unoATresAnos' } }, 'cliente-prof')).toEqual({ ok: true })
    expect(await recibirProfundizacion(repositorio, { habilidad: 'alianzas', respuestas: {} }, 'cliente-prof')).toEqual({ ok: false, errores: { habilidad: 'noEsFuerte' } })
  })

  it('las historias sin permiso para mostrarlas se rechazan en el servidor', async () => {
    const entrada = { logro: 'Armé algo', problemaDificil: '', problemaMundo: '', sectores: [], aceptaMostrar: false }
    expect(await recibirHistorias(new MockRespuestasRepository(), entrada, 'cliente-hist')).toEqual({ ok: false, errores: { aceptaMostrar: 'faltaPermiso' } })
  })

  it('la forma de emprender se valida contra las opciones posibles', async () => {
    const repositorio = new MockRespuestasRepository()
    expect(await recibirForma(repositorio, { respuestas: { riesgo: 'seguro' }, busca: ['finanzas'], socioIdeal: '' }, 'cliente-forma2')).toEqual({ ok: true })
    expect(await recibirForma(repositorio, { respuestas: { riesgo: 'nunca' }, busca: [], socioIdeal: '' }, 'cliente-forma2')).toEqual({ ok: false, errores: { respuestas: 'respuestaInvalida' } })
  })

  it('el cierre calcula el perfil de lo guardado', async () => {
    const repositorio = new MockRespuestasRepository()
    await recibirTareas(repositorio, { marcas: { desarrolloWeb: 'esMiTrabajo' } }, 'cliente-cierre')
    const resultado = await recibirCierre(repositorio, 'cliente-cierre')
    expect(resultado.ok && resultado.perfil.area?.areas).toEqual(['tecnologia'])
  })

  it('un mismo cliente no puede pasar del límite de intentos, y otro cliente no se ve afectado', async () => {
    const repositorio = new MockRespuestasRepository()
    for (let i = 0; i < 80; i++) await recibirTareas(repositorio, { marcas: {} }, 'cliente-insistente')
    expect(await recibirTareas(repositorio, { marcas: {} }, 'cliente-insistente')).toEqual({ ok: false, errores: {}, motivo: 'limite' })
    expect(await recibirCierre(repositorio, 'cliente-insistente')).toEqual({ ok: false, motivo: 'limite' })
    expect(await recibirTareas(repositorio, { marcas: {} }, 'otro-cliente')).toEqual({ ok: true })
  })
})
