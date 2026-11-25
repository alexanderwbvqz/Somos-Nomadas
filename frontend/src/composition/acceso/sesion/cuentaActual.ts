import { obtenerCuentaActual } from '@/modules/acceso/application/obtenerCuentaActual'
import type { CuentaActual } from '@/modules/acceso/domain/sesion'
import { CookieAlmacenDeSesion } from '@/modules/acceso/infrastructure/cookies/CookieAlmacenDeSesion'
import { identificarCliente } from '@/shared/lib/identificarCliente'
import { crearCuentaRepository } from '../fabricas/cuentas'

/**
 * Quién es la persona que hace la petición, o undefined si no ha entrado. Solo para el servidor (páginas, rutas y
 * acciones): lee las cookies de la sesión, que el navegador no puede ver. La renovación del acceso caducado ya la
 * hizo el `proxy` antes de llegar aquí.
 */
export async function cuentaActual(): Promise<CuentaActual | undefined> {
  const cliente = await identificarCliente()
  return await obtenerCuentaActual(crearCuentaRepository(cliente), new CookieAlmacenDeSesion())
}
