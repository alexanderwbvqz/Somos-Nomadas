import { describe, expect, it } from 'vitest'
import { contarPorTipo } from '../../domain/aliados'
import { contactoDe, esIdReservado, tieneContacto, urlSegura } from '../../domain/detalle'
import { MockAliadoRepository } from './MockAliadoRepository'

describe('MockAliadoRepository', () => {
  it('tiene aliados de los tres tipos, cuatro de cada uno', async () => {
    const aliados = await new MockAliadoRepository().listarAliados()
    expect(aliados).toHaveLength(12)
    expect(contarPorTipo(aliados)).toEqual({ mentores: 4, organizadores: 4, estrategicos: 4 })
  })

  it('los identificadores no se repiten, son válidos como ruta y ninguno está reservado', async () => {
    const ids = (await new MockAliadoRepository().listarAliados()).map((aliado) => aliado.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9-]+$/)
      expect(esIdReservado(id)).toBe(false)
    }
  })

  it('todos llevan nombre y una descripción de entre 20 y 40 palabras (la extensión esperada de las reales)', async () => {
    for (const aliado of await new MockAliadoRepository().listarAliados()) {
      const palabras = aliado.descripcion.trim().split(/\s+/).length
      expect(aliado.nombre.length).toBeGreaterThan(0)
      expect(palabras, aliado.nombre).toBeGreaterThanOrEqual(20)
      expect(palabras, aliado.nombre).toBeLessThanOrEqual(40)
    }
  })

  it('hay aliados con detalle completo y otros solo con lo mínimo', async () => {
    const aliados = await new MockAliadoRepository().listarAliados()
    expect(aliados.filter((aliado) => aliado.descripcionLarga.length > 0)).toHaveLength(6)
    expect(aliados.filter((aliado) => aliado.descripcionLarga.length === 0)).toHaveLength(6)
  })

  it('los datos clave son cuatro o ninguno, y cada uno trae valor y etiqueta', async () => {
    for (const aliado of await new MockAliadoRepository().listarAliados()) {
      expect([0, 4]).toContain(aliado.datosClave.length)
      for (const dato of aliado.datosClave) {
        expect(dato.valor.length).toBeGreaterThan(0)
        expect(dato.etiqueta.length).toBeGreaterThan(0)
      }
    }
  })

  it('los enlaces que traen son seguros y hay todas las combinaciones de contacto', async () => {
    const aliados = await new MockAliadoRepository().listarAliados()
    for (const aliado of aliados) {
      if (aliado.sitioWeb) expect(urlSegura(aliado.sitioWeb)).toBeDefined()
      if (aliado.enlaceAgenda) expect(urlSegura(aliado.enlaceAgenda)).toBeDefined()
    }
    const contactos = aliados.map((aliado) => contactoDe(aliado))
    expect(contactos.some((c) => c.agenda && c.whatsapp)).toBe(true)
    expect(contactos.some((c) => c.agenda && !c.whatsapp)).toBe(true)
    expect(contactos.some((c) => !c.agenda && c.whatsapp)).toBe(true)
    expect(aliados.some((aliado) => !tieneContacto(aliado))).toBe(true)
  })
})
