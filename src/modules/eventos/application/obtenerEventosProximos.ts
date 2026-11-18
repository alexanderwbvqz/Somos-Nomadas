import type { Evento } from '../domain/Evento'
import type { EventoRepository } from '../domain/EventoRepository'
import { eventosFuturos } from '../domain/eventos'

export type EventosProximos = {
  /** El evento más cercano; no existe si no hay ninguno programado */
  proximo: Evento | undefined
  /** Los siguientes, en orden */
  siguientes: Evento[]
}

export async function obtenerEventosProximos(repositorio: EventoRepository, ahora: Date = new Date()): Promise<EventosProximos> {
  const futuros = eventosFuturos(await repositorio.listarEventos(), ahora)
  return { proximo: futuros[0], siguientes: futuros.slice(1) }
}
