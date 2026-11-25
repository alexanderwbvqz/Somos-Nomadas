import type { CuentaRepository } from '@/modules/acceso/domain/CuentaRepository'
import { HttpCuentaRepository } from '@/modules/acceso/infrastructure/http/HttpCuentaRepository'
import { MockCuentaRepository } from '@/modules/acceso/infrastructure/mock/MockCuentaRepository'
import { crearClienteHttp } from '@/shared/api/clienteHttp'

// Único sitio que conoce los adaptadores de cuentas: el simulado o el de la API del backend.
// `origen` es la IP real de la persona que origina la petición; se reenvía al backend para que cuente los intentos
// por persona y no por servidor.
const usarSimulados = () => process.env.NEXT_PUBLIC_USAR_MOCKS_ACCESO === 'true'

/** Entrar con Google solo existe en el simulado: con el backend real el botón no se muestra (todavía no hay con qué atenderlo) */
export function googleDisponible(): boolean {
  return usarSimulados()
}

export function crearCuentaRepository(origen?: string): CuentaRepository {
  if (usarSimulados()) return new MockCuentaRepository()

  // Variables solo de servidor (sin NEXT_PUBLIC): el secreto nunca puede llegar al navegador
  const urlBase = process.env.URL_API ?? ''
  if (urlBase.trim() === '') {
    throw new Error('Falta URL_API: la dirección de la API del backend (mira .env.example y copia lo que haga falta a .env.local).')
  }
  return new HttpCuentaRepository(crearClienteHttp({ urlBase, secretoInterno: process.env.SECRETO_INTERNO_API, origen }))
}
