import type { CuentaRepository } from '../domain/CuentaRepository'
import { tieneFormaDeToken } from '../domain/confirmacion'
import { ErrorDeLimite } from '../domain/errores'

export type ResultadoConfirmacion =
  | { ok: true; correo: string }
  /** invalido: el enlace no vale (sin decir por qué); limite: demasiados intentos; fallo: no se pudo comprobar */
  | { ok: false; motivo: 'invalido' | 'limite' | 'fallo' }

// Usa el enlace del correo para confirmar la cuenta. No abre sesión: después se entra con el correo y la clave.
export async function confirmarCorreo(repositorio: CuentaRepository, token: string): Promise<ResultadoConfirmacion> {
  // Lo que no tiene forma de token no puede ser un enlace nuestro: ni se pregunta
  if (!tieneFormaDeToken(token)) return { ok: false, motivo: 'invalido' }
  try {
    const correo = await repositorio.confirmarCorreo(token)
    return correo === undefined ? { ok: false, motivo: 'invalido' } : { ok: true, correo }
  } catch (error) {
    return { ok: false, motivo: error instanceof ErrorDeLimite ? 'limite' : 'fallo' }
  }
}
