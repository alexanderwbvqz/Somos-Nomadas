import type { EventoRepository } from '@/modules/eventos/domain/EventoRepository'
import { MockEventoRepository } from '@/modules/eventos/infrastructure/mock/MockEventoRepository'

// Único sitio que conoce los adaptadores de eventos. Mock mientras no exista el adaptador Http.

/** Los eventos que se muestran son de ejemplo (inventados): no se anuncian en el mapa del sitio */
export function sonEventosDeEjemplo(): boolean {
  return process.env.NEXT_PUBLIC_USAR_MOCKS_EVENTOS === 'true'
}

export function crearEventoRepository(): EventoRepository {
  if (sonEventosDeEjemplo()) return new MockEventoRepository()
  throw new Error(
    'Falta NEXT_PUBLIC_USAR_MOCKS_EVENTOS=true: el adaptador Http de eventos todavía no existe (copia .env.example a .env.local).',
  )
}
