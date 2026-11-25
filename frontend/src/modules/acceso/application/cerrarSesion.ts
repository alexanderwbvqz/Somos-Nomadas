import type { CuentaRepository } from '../domain/CuentaRepository'
import type { AlmacenDeSesion } from '../domain/sesion'

/**
 * Cierra la sesión de quien hace la petición: avisa al backend para que la renovación deje de servir y borra lo
 * guardado. Si el backend no responde, lo guardado se borra igual: salir de la cuenta nunca debe fallar.
 */
export async function cerrarSesion(repositorio: CuentaRepository, almacen: AlmacenDeSesion): Promise<void> {
  try {
    const { renovacion } = await almacen.leer()
    if (renovacion !== undefined) await repositorio.cerrarSesion(renovacion)
  } catch {
    // Sin respuesta del backend: esa sesión caduca sola; aquí se borra de todos modos
  } finally {
    await almacen.borrar()
  }
}
