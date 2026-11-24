import { beforeEach, describe, expect, it } from 'vitest'
import { MockPerfilRepository } from '../infrastructure/mock/MockPerfilRepository'
import { perfilDeEjemplo } from '../infrastructure/mock/perfilDeEjemplo'
import type { PerfilRepository } from '../domain/PerfilRepository'
import { guardarEvidencia } from './guardarEvidencia'
import { guardarSobreMi } from './guardarSobreMi'
import { guardarTrayectoria } from './guardarTrayectoria'
import { obtenerPerfil } from './obtenerPerfil'

const ANIO = 2026

const roto: PerfilRepository = {
  obtener: async () => { throw new Error('x') },
  guardarSobreMi: async () => { throw new Error('x') },
  guardarTrayectoria: async () => { throw new Error('x') },
  guardarEvidencia: async () => { throw new Error('x') },
}

const entrada = { desde: '2020', hasta: '2022', rol: 'Dev', donde: 'Estudio', que: '' }

beforeEach(() => MockPerfilRepository.restablecer())

describe('obtenerPerfil', () => {
  it('devuelve el perfil entero', async () => {
    expect(await obtenerPerfil(new MockPerfilRepository())).toEqual({ ok: true, perfil: perfilDeEjemplo() })
  })

  it('si no se puede leer, avisa con "fallo"', async () => {
    expect(await obtenerPerfil(roto)).toEqual({ ok: false, motivo: 'fallo' })
  })
})

describe('guardarSobreMi', () => {
  it('guarda el texto ya limpio', async () => {
    const repositorio = new MockPerfilRepository()
    expect(await guardarSobreMi(repositorio, '  Soy de Lima.\r\nBusco socio.  ')).toEqual({ ok: true })
    expect((await repositorio.obtener()).sobreMi).toBe('Soy de Lima.\nBusco socio.')
  })

  it('un texto vacío borra lo que había', async () => {
    const repositorio = new MockPerfilRepository()
    expect(await guardarSobreMi(repositorio, '   ')).toEqual({ ok: true })
    expect((await repositorio.obtener()).sobreMi).toBe('')
  })

  it('un texto demasiado largo se rechaza y no cambia lo guardado', async () => {
    const repositorio = new MockPerfilRepository()
    expect(await guardarSobreMi(repositorio, 'a'.repeat(601))).toEqual({ ok: false, errores: { texto: 'textoLargo' } })
    expect((await repositorio.obtener()).sobreMi).toBe(perfilDeEjemplo().sobreMi)
  })

  it('si el repositorio falla, avisa con "fallo"', async () => {
    expect(await guardarSobreMi(roto, 'Hola')).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
  })
})

describe('guardarTrayectoria', () => {
  it('guarda la lista con los años en número y la más reciente primero', async () => {
    const repositorio = new MockPerfilRepository()
    expect(await guardarTrayectoria(repositorio, [entrada, { ...entrada, desde: '2023', hasta: '', rol: 'Líder' }], ANIO)).toEqual({ ok: true })
    expect((await repositorio.obtener()).trayectoria).toEqual([
      { desde: 2023, rol: 'Líder', donde: 'Estudio', que: '' },
      { desde: 2020, hasta: 2022, rol: 'Dev', donde: 'Estudio', que: '' },
    ])
  })

  it('una lista vacía borra la trayectoria', async () => {
    const repositorio = new MockPerfilRepository()
    expect(await guardarTrayectoria(repositorio, [], ANIO)).toEqual({ ok: true })
    expect((await repositorio.obtener()).trayectoria).toEqual([])
  })

  it('rechaza lo inválido, dice cuál entrada falla y no cambia lo guardado', async () => {
    const repositorio = new MockPerfilRepository()
    const resultado = await guardarTrayectoria(repositorio, [entrada, { ...entrada, desde: '2030' }], ANIO)
    expect(resultado).toEqual({ ok: false, errores: { entradas: { 1: { desde: 'anioInvalido' } } } })
    expect((await repositorio.obtener()).trayectoria).toEqual(perfilDeEjemplo().trayectoria)
  })

  it('rechaza más de cinco entradas', async () => {
    const seis = Array.from({ length: 6 }, () => entrada)
    expect(await guardarTrayectoria(new MockPerfilRepository(), seis, ANIO)).toMatchObject({ ok: false, errores: { lista: 'demasiadasEntradas' } })
  })

  it('el año actual lo decide quien llama', async () => {
    const proxima = { ...entrada, desde: '2027', hasta: '' }
    expect(await guardarTrayectoria(new MockPerfilRepository(), [proxima], 2026)).toMatchObject({ ok: false })
    expect(await guardarTrayectoria(new MockPerfilRepository(), [proxima], 2027)).toEqual({ ok: true })
  })

  it('si el repositorio falla, avisa con "fallo"', async () => {
    expect(await guardarTrayectoria(roto, [entrada], ANIO)).toEqual({ ok: false, errores: { entradas: {} }, motivo: 'fallo' })
  })
})

describe('guardarEvidencia', () => {
  it('guarda los enlaces normalizados', async () => {
    const repositorio = new MockPerfilRepository()
    expect(await guardarEvidencia(repositorio, [' https://GitHub.com/ana ', 'https://ana.example'])).toEqual({ ok: true })
    expect((await repositorio.obtener()).evidencia).toEqual(['https://github.com/ana', 'https://ana.example/'])
  })

  it('una lista vacía borra la evidencia', async () => {
    const repositorio = new MockPerfilRepository()
    expect(await guardarEvidencia(repositorio, [])).toEqual({ ok: true })
    expect((await repositorio.obtener()).evidencia).toEqual([])
  })

  it('rechaza lo que no es https, los repetidos y los que pasan de cinco, y no cambia lo guardado', async () => {
    const repositorio = new MockPerfilRepository()
    expect(await guardarEvidencia(repositorio, ['http://a.example'])).toEqual({ ok: false, errores: { enlaces: { 0: 'enlaceInvalido' } } })
    expect(await guardarEvidencia(repositorio, ['https://a.example', 'https://a.example/'])).toEqual({ ok: false, errores: { enlaces: { 1: 'repetido' } } })
    const seis = Array.from({ length: 6 }, (_, i) => `https://a.example/${i}`)
    expect(await guardarEvidencia(repositorio, seis)).toMatchObject({ ok: false, errores: { lista: 'demasiados' } })
    expect((await repositorio.obtener()).evidencia).toEqual(perfilDeEjemplo().evidencia)
  })

  it('si el repositorio falla, avisa con "fallo"', async () => {
    expect(await guardarEvidencia(roto, ['https://a.example'])).toEqual({ ok: false, errores: { enlaces: {} }, motivo: 'fallo' })
  })
})
