import type { PostulacionRepository } from '@/modules/aliados/domain/PostulacionRepository'
import { MockPostulacionRepository } from '@/modules/aliados/infrastructure/mock/MockPostulacionRepository'

// Único sitio que conoce los adaptadores de postulaciones. Simulado mientras no exista el adaptador Http.
export function crearPostulacionRepository(): PostulacionRepository {
  if (process.env.NEXT_PUBLIC_USAR_MOCKS_ALIADOS === 'true') return new MockPostulacionRepository()
  throw new Error(
    'Falta NEXT_PUBLIC_USAR_MOCKS_ALIADOS=true: el adaptador Http de postulaciones todavía no existe (copia .env.example a .env.local).',
  )
}
