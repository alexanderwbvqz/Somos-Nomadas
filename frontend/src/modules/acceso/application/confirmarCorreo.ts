import type { CuentaRepository } from '../domain/CuentaRepository'
import { tieneFormaDeToken, type MarcaDelNavegador } from '../domain/confirmacion'
import { ErrorDeLimite } from '../domain/errores'
import type { AlmacenDeSesion, CredencialDeSesion } from '../domain/sesion'

export type ResultadoConfirmacion =
  /** dentro: además de confirmar se abrió la sesión (el enlace se abrió en el navegador que lo pidió) */
  | { ok: true; correo: string; dentro: boolean }
  /** invalido: el enlace no vale (sin decir por qué); limite: demasiados intentos; fallo: no se pudo comprobar */
  | { ok: false; motivo: 'invalido' | 'limite' | 'fallo' }

/** Dónde se lee la marca de este navegador y dónde se guarda la sesión si se abre */
export type ConfirmarEnEsteNavegador = { marca?: MarcaDelNavegador; almacen?: AlmacenDeSesion }

/**
 * Usa el enlace del correo para confirmar la cuenta. Manda la marca de este navegador: si es el que pidió el enlace,
 * el backend abre también la sesión, que se guarda en el servidor (`almacen`) y no vuelve en el resultado. En otro
 * navegador solo confirma: después se entra con el correo y la clave.
 */
export async function confirmarCorreo(
  repositorio: CuentaRepository,
  token: string,
  { marca, almacen }: ConfirmarEnEsteNavegador = {},
): Promise<ResultadoConfirmacion> {
  // Lo que no tiene forma de token no puede ser un enlace nuestro: ni se pregunta
  if (!tieneFormaDeToken(token)) return { ok: false, motivo: 'invalido' }
  let confirmado
  try {
    confirmado = await repositorio.confirmarCorreo(token, await marca?.leer())
  } catch (error) {
    return { ok: false, motivo: error instanceof ErrorDeLimite ? 'limite' : 'fallo' }
  }
  if (confirmado === undefined) return { ok: false, motivo: 'invalido' }

  // El enlace ya se usó: la marca no vuelve a servir
  await marca?.borrar().catch(() => undefined)
  const dentro = confirmado.credencial !== undefined && almacen !== undefined && (await guardar(almacen, confirmado.credencial))
  return { ok: true, correo: confirmado.correo, dentro }
}

/** Si no se puede guardar, no se está dentro, pero el correo ya quedó confirmado: se entra con la contraseña */
async function guardar(almacen: AlmacenDeSesion, credencial: CredencialDeSesion): Promise<boolean> {
  try {
    await almacen.guardar(credencial)
    return true
  } catch {
    return false
  }
}
