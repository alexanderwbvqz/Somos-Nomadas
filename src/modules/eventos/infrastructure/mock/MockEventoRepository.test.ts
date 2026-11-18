import { describe, expect, it } from 'vitest'
import { eventosFuturos } from '../../domain/eventos'
import { MockEventoRepository } from './MockEventoRepository'

describe('MockEventoRepository', () => {
  it('tiene al menos 30 eventos de ejemplo', async () => {
    expect((await new MockEventoRepository().listarEventos()).length).toBeGreaterThanOrEqual(30)
  })

  it('los identificadores no se repiten', async () => {
    const ids = (await new MockEventoRepository().listarEventos()).map((evento) => evento.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('todos sus eventos quedan en el futuro, sea cual sea el día de hoy', async () => {
    for (const hoy of ['2026-11-18T12:00:00.000Z', '2027-06-30T01:00:00.000Z', '2030-01-01T00:00:00.000Z']) {
      const ahora = new Date(hoy)
      const eventos = await new MockEventoRepository(() => ahora).listarEventos()
      expect(eventosFuturos(eventos, ahora)).toHaveLength(eventos.length)
    }
  })

  it('el más cercano es Match and Building, presencial y en zona de Lima', async () => {
    const ahora = new Date('2026-11-18T12:00:00.000Z')
    const [primero] = eventosFuturos(await new MockEventoRepository(() => ahora).listarEventos(), ahora)
    expect(primero).toMatchObject({ id: 'match-and-building', modalidad: 'presencial', zonaHoraria: 'America/Lima' })
  })

  it('todos llevan una descripción de entre 20 y 40 palabras (la extensión esperada de las reales)', async () => {
    for (const evento of await new MockEventoRepository().listarEventos()) {
      const palabras = evento.descripcion.trim().split(/\s+/).length
      expect(palabras, evento.nombre).toBeGreaterThanOrEqual(20)
      expect(palabras, evento.nombre).toBeLessThanOrEqual(40)
    }
  })

  it('hay eventos presenciales y en línea, y de varias ciudades', async () => {
    const eventos = await new MockEventoRepository().listarEventos()
    expect(new Set(eventos.map((evento) => evento.modalidad))).toEqual(new Set(['presencial', 'enlinea']))
    expect(new Set(eventos.map((evento) => evento.zonaHoraria)).size).toBeGreaterThan(2)
  })
})
