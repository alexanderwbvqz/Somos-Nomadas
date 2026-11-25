import type { CuentaRepository } from '../domain/CuentaRepository'
import type { AlmacenDeSesion } from '../domain/sesion'
import { ErrorDeCamposInvalidos, ErrorDeCorreoSinConfirmar, ErrorDeLimite } from '../domain/errores'
import { camposRechazados } from './camposRechazados'
import { hayErroresCuenta, normalizarCorreo, validarInicioSesion, type DatosInicioSesion, type ErroresInicioSesion } from '../domain/cuenta'

const CAMPOS_DEL_INICIO_DE_SESION = ['correo', 'clave'] as const

export type ResultadoInicioSesion =
  | { ok: true; correo: string }
  | {
      ok: false
      errores: ErroresInicioSesion
      /** credenciales: correo o contraseña no corresponden (sin decir cuál); limite: demasiados intentos; fallo: error al comprobar */
      motivo?: 'credenciales' | 'limite' | 'sinConfirmar' | 'fallo'
    }

/**
 * Comprueba el correo y la contraseña y, si valen, abre la sesión: la credencial se guarda en el servidor
 * (`almacen`) y no vuelve en el resultado, que sí puede llegar al navegador.
 */
export async function iniciarSesion(
  repositorio: CuentaRepository,
  almacen: AlmacenDeSesion,
  datos: DatosInicioSesion,
): Promise<ResultadoInicioSesion> {
  const errores = validarInicioSesion(datos)
  if (hayErroresCuenta(errores)) return { ok: false, errores }

  try {
    const entrada = await repositorio.iniciarSesion(normalizarCorreo(datos.correo), datos.clave)
    if (entrada === undefined) return { ok: false, errores: {}, motivo: 'credenciales' }
    await almacen.guardar(entrada.credencial)
    return { ok: true, correo: entrada.correo }
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
