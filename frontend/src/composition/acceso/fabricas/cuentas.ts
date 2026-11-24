import type { CuentaRepository } from '@/modules/acceso/domain/CuentaRepository'
import { MockCuentaRepository } from '@/modules/acceso/infrastructure/mock/MockCuentaRepository'

// Único sitio que conoce los adaptadores de cuentas. Simulado mientras no exista el adaptador Http.
export function crearCuentaRepository(): CuentaRepository {
  if (process.env.NEXT_PUBLIC_USAR_MOCKS_ACCESO === 'true') return new MockCuentaRepository()
  throw new Error(
    'Falta NEXT_PUBLIC_USAR_MOCKS_ACCESO=true: el adaptador Http de acceso todavía no existe (copia .env.example a .env.local).',
  )
}
