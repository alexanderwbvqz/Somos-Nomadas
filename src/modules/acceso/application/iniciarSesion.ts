import type { CuentaRepository } from '../domain/CuentaRepository'
import { hayErroresCuenta, validarInicioSesion, type DatosInicioSesion, type ErroresInicioSesion } from '../domain/cuenta'

export type ResultadoInicioSesion =
  | { ok: true; nombre: string }
  | {
      ok: false
      errores: ErroresInicioSesion
      /** credenciales: correo o contraseña no corresponden (sin decir cuál); limite: demasiados intentos; fallo: error al comprobar */
      motivo?: 'credenciales' | 'limite' | 'fallo'
    }

export async function iniciarSesion(repositorio: CuentaRepository, datos: DatosInicioSesion): Promise<ResultadoInicioSesion> {
  const errores = validarInicioSesion(datos)
  if (hayErroresCuenta(errores)) return { ok: false, errores }

  try {
    const cuenta = await repositorio.iniciarSesion(datos.correo.trim().toLowerCase(), datos.clave)
    return cuenta ? { ok: true, nombre: cuenta.nombre } : { ok: false, errores: {}, motivo: 'credenciales' }
  } catch {
    return { ok: false, errores: {}, motivo: 'fallo' }
  }
}
