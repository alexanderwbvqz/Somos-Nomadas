import type { Evento } from './Evento'

export interface EventoRepository {
  /** Todos los eventos conocidos, en cualquier orden */
  listarEventos(): Promise<Evento[]>
}
