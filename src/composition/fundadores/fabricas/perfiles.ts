import type { PerfilRepository } from '@/modules/fundadores/domain/PerfilRepository'
import { MockPerfilRepository } from '@/modules/fundadores/infrastructure/mock/MockPerfilRepository'

// Único sitio que conoce los adaptadores de perfiles. Simulado mientras no exista el adaptador Http.
export function crearPerfilRepository(): PerfilRepository {
  if (process.env.NEXT_PUBLIC_USAR_MOCKS_FUNDADORES === 'true') return new MockPerfilRepository()
  throw new Error(
    'Falta NEXT_PUBLIC_USAR_MOCKS_FUNDADORES=true: el adaptador Http de fundadores todavía no existe (copia .env.example a .env.local).',
  )
}
