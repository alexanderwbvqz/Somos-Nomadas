import { describe, expect, it } from 'vitest'
import type { Evento } from './Evento'
import { diasHasta, eventosFuturos } from './eventos'

function evento(id: string, inicio: string): Evento {
  return { id, nombre: id, descripcion: '', inicio, zonaHoraria: 'America/Lima', lugar: 'Lima', modalidad: 'presencial' }
}

describe('eventosFuturos', () => {
  const ahora = new Date('2026-11-18T12:00:00.000Z')

  it('descarta los eventos que ya empezaron y ordena el resto por fecha', () => {
    const resultado = eventosFuturos(
      [evento('c', '2027-02-01T23:00:00.000Z'), evento('pasado', '2026-11-01T23:00:00.000Z'), evento('a', '2026-12-12T23:00:00.000Z')],
      ahora,
    )
    expect(resultado.map((e) => e.id)).toEqual(['a', 'c'])
  })

  it('un evento que empieza justo ahora ya no es próximo', () => {
    expect(eventosFuturos([evento('ahora', ahora.toISOString())], ahora)).toEqual([])
  })

  it('con una lista vacía devuelve una lista vacía', () => {
    expect(eventosFuturos([], ahora)).toEqual([])
  })
})

describe('diasHasta', () => {
  const zona = 'America/Lima' // UTC-5

  it('el mismo día de calendario es 0', () => {
    expect(diasHasta('2026-11-18T23:00:00.000Z', new Date('2026-11-18T15:00:00.000Z'), zona)).toBe(0)
  })

  it('el día siguiente es 1 aunque falten menos de 24 horas', () => {
    // 21:00 en Lima del día 18 → el evento es a las 08:00 en Lima del día 19
    expect(diasHasta('2026-11-19T13:00:00.000Z', new Date('2026-11-19T02:00:00.000Z'), zona)).toBe(1)
  })

  it('cuenta los días de calendario en la zona del evento, no en UTC', () => {
    // En UTC ya es 19, pero en Lima todavía es 18 (23:30 locales): el evento del 19 en Lima está a 1 día
    expect(diasHasta('2026-11-19T20:00:00.000Z', new Date('2026-11-19T04:30:00.000Z'), zona)).toBe(1)
  })

  it('24 días antes devuelve 24', () => {
    expect(diasHasta('2026-12-12T23:00:00.000Z', new Date('2026-11-18T12:00:00.000Z'), zona)).toBe(24)
  })
})
