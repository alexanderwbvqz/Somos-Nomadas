import { beforeEach, describe, expect, it } from 'vitest'
import { hayErroresEvidencia, validarEvidencia } from '../../domain/evidencia'
import { capasDelPerfil } from '../../domain/perfil'
import { validarSobreMi } from '../../domain/sobreMi'
import { hayErroresTrayectoria, validarTrayectoria } from '../../domain/trayectoria'
import { MockPerfilRepository } from './MockPerfilRepository'
import { perfilDeEjemplo } from './perfilDeEjemplo'

beforeEach(() => MockPerfilRepository.restablecer())

describe('MockPerfilRepository', () => {
  it('devuelve el perfil de ejemplo', async () => {
    expect(await new MockPerfilRepository().obtener()).toEqual(perfilDeEjemplo())
  })

  it('devuelve una copia: cambiarla no cambia lo guardado', async () => {
    const repositorio = new MockPerfilRepository()
    const primero = await repositorio.obtener()
    primero.sobreMi = 'cambiado desde fuera'
    primero.evidencia.push('https://x.example')
    primero.trayectoria[0]!.rol = 'otro'
    expect(await repositorio.obtener()).toEqual(perfilDeEjemplo())
  })

  it('guarda el Sobre mí', async () => {
    const repositorio = new MockPerfilRepository()
    await repositorio.guardarSobreMi('Soy de Lima.')
    expect((await repositorio.obtener()).sobreMi).toBe('Soy de Lima.')
  })

  it('guarda la trayectoria y la evidencia, y solo eso', async () => {
    const repositorio = new MockPerfilRepository()
    await repositorio.guardarTrayectoria([{ desde: 2024, rol: 'Dev', donde: 'Mi proyecto', que: '' }])
    await repositorio.guardarEvidencia(['https://a.example/uno'])
    const guardado = await repositorio.obtener()
    expect(guardado.trayectoria).toEqual([{ desde: 2024, rol: 'Dev', donde: 'Mi proyecto', que: '' }])
    expect(guardado.evidencia).toEqual(['https://a.example/uno'])
    expect(guardado.sobreMi).toBe(perfilDeEjemplo().sobreMi)
  })

  it('lo guardado lo ven otras instancias, como un servidor que atiende varias peticiones', async () => {
    await new MockPerfilRepository().guardarSobreMi('Hola')
    expect((await new MockPerfilRepository().obtener()).sobreMi).toBe('Hola')
  })

  it('restablecer vuelve al perfil de ejemplo', async () => {
    const repositorio = new MockPerfilRepository()
    await repositorio.guardarSobreMi('Otro')
    MockPerfilRepository.restablecer()
    expect((await repositorio.obtener()).sobreMi).toBe(perfilDeEjemplo().sobreMi)
  })
})

describe('perfilDeEjemplo', () => {
  it('respeta las reglas del dominio: lo que ya trae se podría haber guardado', () => {
    const ejemplo = perfilDeEjemplo()
    expect(validarSobreMi(ejemplo.sobreMi)).toEqual({})
    const comoFormulario = ejemplo.trayectoria.map((e) => ({ desde: String(e.desde), hasta: e.hasta === undefined ? '' : String(e.hasta), rol: e.rol, donde: e.donde, que: e.que }))
    expect(hayErroresTrayectoria(validarTrayectoria(comoFormulario, 2026))).toBe(false)
    expect(hayErroresEvidencia(validarEvidencia(ejemplo.evidencia))).toBe(false)
  })

  it('trae las tres capas del perfil hechas, y las tres habilidades fuertes con su detalle', () => {
    const ejemplo = perfilDeEjemplo()
    expect(capasDelPerfil(ejemplo).every((capa) => capa.hecha)).toBe(true)
    expect(ejemplo.habilidades.filter((habilidad) => habilidad.detalle !== undefined)).toHaveLength(3)
  })

  it('cada habilidad tiene un nivel de 1 a 5, y las estimadas no pasan de 3', () => {
    for (const habilidad of perfilDeEjemplo().habilidades) {
      expect(habilidad.nivel).toBeGreaterThanOrEqual(1)
      expect(habilidad.nivel).toBeLessThanOrEqual(5)
      if (habilidad.estimado) expect(habilidad.nivel).toBeLessThanOrEqual(3)
    }
  })
})
