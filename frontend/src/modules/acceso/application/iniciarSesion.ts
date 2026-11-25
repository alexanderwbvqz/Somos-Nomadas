import type { CuentaRepository } from '../domain/CuentaRepository'
import { ErrorDeCamposInvalidos, ErrorDeCorreoSinConfirmar, ErrorDeLimite } from '../domain/errores'
import { camposRechazados } from './camposRechazados'
import { hayErroresCuenta, validarInicioSesion, type DatosInicioSesion, type ErroresInicioSesion } from '../domain/cuenta'

const CAMPOS_DEL_INICIO_DE_SESION = ['correo', 'clave'] as const

export type ResultadoInicioSesion =
  | { ok: true; correo: string }
  | {
      ok: false
      errores: ErroresInicioSesion
      /** credenciales: correo o contraseña no corresponden (sin decir cuál); limite: demasiados intentos; fallo: error al comprobar */
      motivo?: 'credenciales' | 'limite' | 'sinConfirmar' | 'fallo'
    }

export async function iniciarSesion(repositorio: CuentaRepository, datos: DatosInicioSesion): Promise<ResultadoInicioSesion> {
  const errores = validarInicioSesion(datos)
  if (hayErroresCuenta(errores)) return { ok: false, errores }

  try {
    const cuenta = await repositorio.iniciarSesion(datos.correo.trim().toLowerCase(), datos.clave)
    return cuenta ? { ok: true, correo: cuenta.correo } : { ok: false, errores: {}, motivo: 'credenciales' }
  } catch (error) {
    if (error instanceof ErrorDeLimite) return { ok: false, errores: {}, motivo: 'limite' }
    if (error instanceof ErrorDeCorreoSinConfirmar) return { ok: false, errores: {}, motivo: 'sinConfirmar' }
    if (error instanceof ErrorDeCamposInvalidos) {
      const errores = camposRechazados(error, CAMPOS_DEL_INICIO_DE_SESION)
      if (hayErroresCuenta(errores)) return { ok: false, errores }
    }
    return { ok: false, errores: {}, motivo: 'fallo' }
  }
}
