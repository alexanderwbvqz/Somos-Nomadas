import type { AnalisisRepository } from '@/modules/habilidades/domain/AnalisisRepository'
import { MockAnalisisRepository } from '@/modules/habilidades/infrastructure/mock/MockAnalisisRepository'

/** Si hay algo que analice lo que sube la persona. Por ahora solo el adaptador simulado; con el Http real, esto cambia. */
export function hayAnalisis(): boolean {
  return process.env.NEXT_PUBLIC_USAR_MOCKS_HABILIDADES === 'true'
}

// Único sitio que conoce los adaptadores del análisis. Simulado mientras no exista el adaptador Http.
export function crearAnalisisRepository(): AnalisisRepository {
  if (hayAnalisis()) return new MockAnalisisRepository()
  throw new Error(
    'Falta NEXT_PUBLIC_USAR_MOCKS_HABILIDADES=true: el adaptador Http del análisis todavía no existe (copia .env.example a .env.local).',
  )
}
