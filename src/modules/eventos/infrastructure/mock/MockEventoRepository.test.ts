import { describe, expect, it } from 'vitest'
import { eventosFuturos } from '../../domain/eventos'
import { MockEventoRepository } from './MockEventoRepository'

describe('MockEventoRepository', () => {
  it('todos sus eventos quedan en el futuro, sea cual sea el día de hoy', async () => {
    for (const hoy of ['2026-11-18T12:00:00.000Z', '2027-06-30T01:00:00.000Z', '2030-01-01T00:00:00.000Z']) {
      const ahora = new Date(hoy)
      const eventos = await new MockEventoRepository(() => ahora).listarEventos()
      expect(eventosFuturos(eventos, ahora)).toHaveLength(eventos.length)
    }
  })

  it('el primero es Match and Building, presencial y en zona de Lima', async () => {
    const [primero] = await new MockEventoRepository().listarEventos()
    expect(primero).toMatchObject({ id: 'match-and-building', modalidad: 'presencial', zonaHoraria: 'America/Lima' })
  })
})
