import { beforeEach, describe, expect, it } from 'vitest'
import { MockBienvenidaRepository } from '../mock/MockBienvenidaRepository'
import { leerDatosBienvenida } from '../mappers/bienvenidaSchema'
import { recibirBienvenida } from './recepcionBienvenida'

const valido = { nombre: 'Ana', apellidos: 'Torres', pais: 'PE', ciudad: '', busca: ['explorando'] }

describe('leerDatosBienvenida', () => {
  it('acepta la forma correcta', () => {
    expect(leerDatosBienvenida(valido)).toEqual(valido)
  })

  it('rechaza lo que no tiene la forma: país o búsqueda desconocidos, tipos erróneos, textos enormes', () => {
    expect(leerDatosBienvenida({ ...valido, pais: 'XX' })).toBeUndefined()
    expect(leerDatosBienvenida({ ...valido, busca: ['otraCosa'] })).toBeUndefined()
    expect(leerDatosBienvenida({ ...valido, nombre: 5 })).toBeUndefined()
    expect(leerDatosBienvenida({ ...valido, nombre: 'a'.repeat(5000) })).toBeUndefined()
    expect(leerDatosBienvenida(undefined)).toBeUndefined()
  })
})

describe('recibirBienvenida', () => {
  beforeEach(() => MockBienvenidaRepository.vaciar())

  it('guarda lo válido', async () => {
    expect(await recibirBienvenida(new MockBienvenidaRepository(), valido, 'cliente-valido')).toEqual({ ok: true, nombre: 'Ana' })
    expect(MockBienvenidaRepository.guardado()?.pais).toBe('PE')
  })

  it('lo que no tiene la forma responde "fallo" y no guarda', async () => {
    expect(await recibirBienvenida(new MockBienvenidaRepository(), { nada: 1 }, 'cliente-forma')).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
    expect(MockBienvenidaRepository.guardado()).toBeUndefined()
  })

  it('un mismo cliente no puede pasar del límite de intentos', async () => {
    const repositorio = new MockBienvenidaRepository()
    for (let i = 0; i < 20; i++) await recibirBienvenida(repositorio, valido, 'cliente-insistente')
    expect(await recibirBienvenida(repositorio, valido, 'cliente-insistente')).toEqual({ ok: false, errores: {}, motivo: 'limite' })
    // otro cliente no se ve afectado
    expect((await recibirBienvenida(repositorio, valido, 'otro-cliente')).ok).toBe(true)
  })
})
