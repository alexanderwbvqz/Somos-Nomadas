import { describe, expect, it } from 'vitest'
import type { Evento } from '../domain/Evento'
import type { EventoRepository } from '../domain/EventoRepository'
import { obtenerEventosProximos } from './obtenerEventosProximos'

function evento(id: string, inicio: string): Evento {
  return { id, nombre: id, descripcion: '', inicio, zonaHoraria: 'America/Lima', lugar: 'Lima', modalidad: 'presencial' }
}

function repositorioCon(eventos: Evento[]): EventoRepository {
  return { listarEventos: async () => eventos }
}

const ahora = new Date('2026-11-18T12:00:00.000Z')

describe('obtenerEventosProximos', () => {
  it('el próximo es el más cercano y el resto queda en siguientes, en orden', async () => {
    const resultado = await obtenerEventosProximos(
      repositorioCon([evento('c', '2027-02-01T23:00:00.000Z'), evento('a', '2026-12-12T23:00:00.000Z'), evento('b', '2027-01-10T23:00:00.000Z')]),
      ahora,
    )
    expect(resultado.proximo?.id).toBe('a')
    expect(resultado.siguientes.map((e) => e.id)).toEqual(['b', 'c'])
  })

  it('ignora los eventos pasados', async () => {
    const resultado = await obtenerEventosProximos(repositorioCon([evento('viejo', '2026-01-01T23:00:00.000Z')]), ahora)
    expect(resultado.proximo).toBeUndefined()
    expect(resultado.siguientes).toEqual([])
  })

  it('sin eventos no hay próximo', async () => {
    const resultado = await obtenerEventosProximos(repositorioCon([]), ahora)
    expect(resultado.proximo).toBeUndefined()
  })
})
