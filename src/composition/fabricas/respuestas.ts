import type { RespuestasRepository } from '@/modules/habilidades/domain/RespuestasRepository'
import { MockRespuestasRepository } from '@/modules/habilidades/infrastructure/mock/MockRespuestasRepository'

// Único sitio que conoce los adaptadores de las respuestas. Simulado mientras no exista el adaptador Http.
export function crearRespuestasRepository(): RespuestasRepository {
  if (process.env.NEXT_PUBLIC_USAR_MOCKS_HABILIDADES === 'true') return new MockRespuestasRepository()
  throw new Error(
    'Falta NEXT_PUBLIC_USAR_MOCKS_HABILIDADES=true: el adaptador Http de las respuestas todavía no existe (copia .env.example a .env.local).',
  )
}
