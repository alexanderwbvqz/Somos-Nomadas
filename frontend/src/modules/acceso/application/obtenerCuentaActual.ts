import type { CuentaRepository } from '../domain/CuentaRepository'
import type { AlmacenDeSesion, CuentaActual } from '../domain/sesion'

/**
 * Quién es la persona que hace la petición, o undefined si no hay sesión abierta. Si el backend no responde, el
 * error sale: una caída no es lo mismo que «nadie ha entrado».
 */
export async function obtenerCuentaActual(repositorio: CuentaRepository, almacen: AlmacenDeSesion): Promise<CuentaActual | undefined> {
  const { acceso } = await almacen.leer()
  if (acceso === undefined) return undefined
  return await repositorio.obtenerCuenta(acceso)
}
