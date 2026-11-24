import type { HistoriasRepository } from '@/modules/landing/domain/HistoriasRepository'
import { MockHistoriasRepository } from '@/modules/landing/infrastructure/mock/MockHistoriasRepository'

// Único sitio que conoce los adaptadores de las historias de la landing. Simulado mientras no exista dónde guardarlas de verdad.
export function crearHistoriasRepository(): HistoriasRepository {
  if (process.env.NEXT_PUBLIC_USAR_MOCKS_LANDING === 'true') return new MockHistoriasRepository()
  throw new Error(
    'Falta NEXT_PUBLIC_USAR_MOCKS_LANDING=true: el adaptador real de las historias todavía no existe (copia .env.example a .env.local).',
  )
}
