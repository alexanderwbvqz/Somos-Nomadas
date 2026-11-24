import type { BienvenidaRepository } from '@/modules/fundadores/domain/BienvenidaRepository'
import { MockBienvenidaRepository } from '@/modules/fundadores/infrastructure/mock/MockBienvenidaRepository'

// Único sitio que conoce los adaptadores de perfiles. Simulado mientras no exista el adaptador Http.
export function crearBienvenidaRepository(): BienvenidaRepository {
  if (process.env.NEXT_PUBLIC_USAR_MOCKS_FUNDADORES === 'true') return new MockBienvenidaRepository()
  throw new Error(
    'Falta NEXT_PUBLIC_USAR_MOCKS_FUNDADORES=true: el adaptador Http de fundadores todavía no existe (copia .env.example a .env.local).',
  )
}
