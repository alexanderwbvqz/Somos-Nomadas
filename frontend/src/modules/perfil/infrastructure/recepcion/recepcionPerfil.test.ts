import { beforeEach, describe, expect, it } from 'vitest'
import { MockPerfilRepository } from '../mock/MockPerfilRepository'
import { perfilDeEjemplo } from '../mock/perfilDeEjemplo'
import { recibirEvidencia, recibirSobreMi, recibirTrayectoria } from './recepcionPerfil'

const entrada = { desde: '2020', hasta: '2022', rol: 'Dev', donde: 'Estudio', que: '' }

beforeEach(() => MockPerfilRepository.restablecer())

describe('recepcionPerfil', () => {
  it('recibe y guarda el Sobre mí', async () => {
    const repositorio = new MockPerfilRepository()
    expect(await recibirSobreMi(repositorio, { texto: ' Hola ' }, 'cliente-sobre')).toEqual({ ok: true })
    expect((await repositorio.obtener()).sobreMi).toBe('Hola')
  })

  it('recibe y guarda la trayectoria y la evidencia', async () => {
    const repositorio = new MockPerfilRepository()
    expect(await recibirTrayectoria(repositorio, { entradas: [entrada] }, 'cliente-ok', 2026)).toEqual({ ok: true })
    expect(await recibirEvidencia(repositorio, { enlaces: ['https://a.example/uno'] }, 'cliente-ok')).toEqual({ ok: true })
    const guardado = await repositorio.obtener()
    expect(guardado.trayectoria).toEqual([{ desde: 2020, hasta: 2022, rol: 'Dev', donde: 'Estudio', que: '' }])
    expect(guardado.evidencia).toEqual(['https://a.example/uno'])
  })

  it('lo que no tiene la forma esperada responde "fallo" y no guarda nada', async () => {
    const repositorio = new MockPerfilRepository()
    expect(await recibirSobreMi(repositorio, { texto: 5 }, 'cliente-forma')).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
    expect(await recibirTrayectoria(repositorio, 'hola', 'cliente-forma')).toEqual({ ok: false, errores: { entradas: {} }, motivo: 'fallo' })
    expect(await recibirEvidencia(repositorio, { enlaces: [5] }, 'cliente-forma')).toEqual({ ok: false, errores: { enlaces: {} }, motivo: 'fallo' })
    expect(await repositorio.obtener()).toEqual(perfilDeEjemplo())
  })

  it('las reglas del dominio se aplican en el servidor aunque el navegador las haya saltado', async () => {
    const repositorio = new MockPerfilRepository()
    expect(await recibirEvidencia(repositorio, { enlaces: ['javascript:alert(1)'] }, 'cliente-dominio')).toEqual({ ok: false, errores: { enlaces: { 0: 'enlaceInvalido' } } })
    expect(await recibirEvidencia(repositorio, { enlaces: ['https://banco.com@otro.example'] }, 'cliente-dominio')).toEqual({ ok: false, errores: { enlaces: { 0: 'enlaceInvalido' } } })
    expect(await recibirSobreMi(repositorio, { texto: 'a'.repeat(700) }, 'cliente-dominio')).toEqual({ ok: false, errores: { texto: 'textoLargo' } })
    expect(await recibirTrayectoria(repositorio, { entradas: [{ ...entrada, desde: '2031' }] }, 'cliente-dominio', 2026)).toMatchObject({ ok: false })
    expect(await repositorio.obtener()).toEqual(perfilDeEjemplo())
  })

  it('el año actual de la trayectoria sale del reloj del servidor si no se indica', async () => {
    const anioDeHoy = new Date().getFullYear()
    expect(await recibirTrayectoria(new MockPerfilRepository(), { entradas: [{ ...entrada, desde: String(anioDeHoy), hasta: '' }] }, 'cliente-reloj')).toEqual({ ok: true })
    expect(await recibirTrayectoria(new MockPerfilRepository(), { entradas: [{ ...entrada, desde: String(anioDeHoy + 1), hasta: '' }] }, 'cliente-reloj')).toMatchObject({ ok: false })
  })

  it('un mismo cliente que insiste demasiado recibe "limite", y otro cliente no se ve afectado', async () => {
    const repositorio = new MockPerfilRepository()
    for (let i = 0; i < 60; i++) expect(await recibirSobreMi(repositorio, { texto: `v${i}` }, 'cliente-insistente')).toEqual({ ok: true })
    expect(await recibirSobreMi(repositorio, { texto: 'otra' }, 'cliente-insistente')).toEqual({ ok: false, errores: {}, motivo: 'limite' })
    expect(await recibirEvidencia(repositorio, { enlaces: [] }, 'cliente-insistente')).toEqual({ ok: false, errores: { enlaces: {} }, motivo: 'limite' })
    expect((await repositorio.obtener()).sobreMi).toBe('v59')
    expect(await recibirSobreMi(repositorio, { texto: 'otra' }, 'cliente-tranquilo')).toEqual({ ok: true })
  })
})
