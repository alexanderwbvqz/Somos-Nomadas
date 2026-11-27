import type { AliadoRepository } from '@/modules/aliados/domain/AliadoRepository'
import { MockAliadoRepository } from '@/modules/aliados/infrastructure/mock/MockAliadoRepository'

// Único sitio que conoce los adaptadores de aliados. Mock mientras no exista el adaptador Http.

/** Los aliados que se muestran son de ejemplo (inventados): no se anuncian ni se dejan indexar */
export function sonAliadosDeEjemplo(): boolean {
  return process.env.NEXT_PUBLIC_USAR_MOCKS_ALIADOS === 'true'
}

export function crearAliadoRepository(): AliadoRepository {
  if (sonAliadosDeEjemplo()) return new MockAliadoRepository()
  throw new Error(
    'Falta NEXT_PUBLIC_USAR_MOCKS_ALIADOS=true: el adaptador Http de aliados todavía no existe (copia .env.example a .env.local).',
  )
}
