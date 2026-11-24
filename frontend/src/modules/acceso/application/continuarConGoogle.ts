import type { CuentaRepository } from '../domain/CuentaRepository'

export type ResultadoGoogle =
  | { ok: true; correo: string }
  /** rechazada: Google no validó la credencial; limite: demasiados intentos; fallo: error al comprobar */
  | { ok: false; motivo: 'rechazada' | 'limite' | 'fallo' }

// Entrar o crear la cuenta con Google. La cuenta de Google ya trae el correo verificado, así que no hace falta
// el enlace de confirmación ni pedir contraseña.
export async function continuarConGoogle(repositorio: CuentaRepository, credencial: string): Promise<ResultadoGoogle> {
  if (credencial.trim() === '') return { ok: false, motivo: 'rechazada' }

  try {
    const cuenta = await repositorio.iniciarConGoogle(credencial)
    return cuenta ? { ok: true, correo: cuenta.correo } : { ok: false, motivo: 'rechazada' }
  } catch {
    return { ok: false, motivo: 'fallo' }
  }
}
