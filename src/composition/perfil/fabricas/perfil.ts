import type { PerfilRepository } from '@/modules/perfil/domain/PerfilRepository'
import { MockPerfilRepository } from '@/modules/perfil/infrastructure/mock/MockPerfilRepository'

// Único sitio que conoce los adaptadores del perfil. Simulado mientras no exista el adaptador Http.
export function crearPerfilRepository(): PerfilRepository {
  if (process.env.NEXT_PUBLIC_USAR_MOCKS_PERFIL === 'true') return new MockPerfilRepository()
  throw new Error(
    'Falta NEXT_PUBLIC_USAR_MOCKS_PERFIL=true: el adaptador Http del perfil todavía no existe (copia .env.example a .env.local).',
  )
}
