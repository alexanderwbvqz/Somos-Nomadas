import type { CuentaRepository } from '../domain/CuentaRepository'
import type { CredencialDeSesion } from '../domain/sesion'

export type ResultadoRenovacion =
  /** Hay una credencial nueva: hay que guardarla */
  | { estado: 'renovada'; credencial: CredencialDeSesion }
  /** El backend dice que esa sesión ya no vale: hay que borrar lo guardado */
  | { estado: 'rechazada' }
  /** No se pudo preguntar (caída, límite…): no se sabe, así que no se toca nada y se reintenta en la próxima petición */
  | { estado: 'sin_respuesta' }

/** Cambia una renovación por una credencial nueva. No guarda nada: quien la llama decide dónde. */
export async function renovarSesion(repositorio: CuentaRepository, renovacion: string): Promise<ResultadoRenovacion> {
  try {
    const credencial = await repositorio.renovarSesion(renovacion)
    return credencial === undefined ? { estado: 'rechazada' } : { estado: 'renovada', credencial }
  } catch {
    return { estado: 'sin_respuesta' }
  }
}
