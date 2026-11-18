import type { Evento } from '../../domain/Evento'
import type { EventoRepository } from '../../domain/EventoRepository'

const ZONA = 'America/Lima'

// inventado: eventos de ejemplo hasta tener los reales o el backend.
// "Match and Building" es un nombre real (documento de negocio); sus fechas, lugares y
// descripciones son de ejemplo. Las fechas se calculan desde hoy para que siempre queden en el futuro.
export class MockEventoRepository implements EventoRepository {
  constructor(private readonly ahora: () => Date = () => new Date()) {}

  async listarEventos(): Promise<Evento[]> {
    const base = this.ahora()
    // 18:00 en Lima (UTC-5) = 23:00 UTC, a "dias" días de hoy
    const inicio = (dias: number) =>
      new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + dias, 23, 0)).toISOString()

    return [
      {
        id: 'match-and-building',
        nombre: 'Match and Building',
        descripcion:
          'Una noche para conocer a las personas que el match te sugiere, con dinámicas para romper el hielo y encontrar con quién construir.',
        inicio: inicio(24),
        zonaHoraria: ZONA,
        lugar: 'Lima · por confirmar',
        modalidad: 'presencial',
      },
      {
        id: 'networking-aliados',
        nombre: 'Noche de networking con aliados',
        descripcion: 'Encuentro con mentores y organizadores de la comunidad.',
        inicio: inicio(63),
        zonaHoraria: ZONA,
        lugar: 'Lima',
        modalidad: 'presencial',
      },
      {
        id: 'taller-cofundador',
        nombre: 'Taller: cómo elegir a tu cofundador',
        descripcion: 'Criterios y preguntas para decidir con quién fundar.',
        inicio: inicio(84),
        zonaHoraria: ZONA,
        lugar: 'Lima',
        modalidad: 'presencial',
      },
    ]
  }
}
