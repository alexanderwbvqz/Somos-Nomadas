import type { CuentaRepository } from '../domain/CuentaRepository'
import { IDIOMA_DEL_CORREO_POR_DEFECTO, type IdiomaDelCorreo } from '../domain/confirmacion'
import { ErrorDeCamposInvalidos, ErrorDeLimite } from '../domain/errores'
import { camposRechazados } from './camposRechazados'
import {
  esRobotRegistro,
  hayErroresCuenta,
  limpiarRegistro,
  validarRegistro,
  type DatosRegistro,
  type ErroresRegistro,
} from '../domain/cuenta'

// Los campos del formulario de registro (el campo trampa no se muestra)
const CAMPOS_DEL_REGISTRO = ['correo', 'clave', 'aceptaPolitica'] as const

export type ResultadoRegistro =
  | { ok: true; correo: string }
  | {
      ok: false
      /** Qué campos tienen problema; vacío si el fallo no es de los datos */
      errores: ErroresRegistro
      /** limite: demasiados intentos seguidos; fallo: no se pudo completar */
      motivo?: 'limite' | 'fallo'
    }

// Valida otra vez, en el servidor, lo que mandó el navegador; si todo está bien crea la cuenta. El backend envía el
// enlace de confirmación en `idioma`.
export async function registrarCuenta(
  repositorio: CuentaRepository,
  datos: DatosRegistro,
  idioma: IdiomaDelCorreo = IDIOMA_DEL_CORREO_POR_DEFECTO,
): Promise<ResultadoRegistro> {
  // Un robot rellena el campo trampa: se responde como si todo hubiera ido bien, sin crear nada
  if (esRobotRegistro(datos)) return { ok: true, correo: datos.correo.trim() }

  const errores = validarRegistro(datos)
  if (hayErroresCuenta(errores)) return { ok: false, errores }

  const cuenta = limpiarRegistro(datos)
  try {
    await repositorio.registrar(cuenta, idioma)
    return { ok: true, correo: cuenta.correo }
  } catch (error) {
    if (error instanceof ErrorDeLimite) return { ok: false, errores: {}, motivo: 'limite' }
    if (error instanceof ErrorDeCamposInvalidos) {
      const errores = camposRechazados(error, CAMPOS_DEL_REGISTRO)
      // Si ninguno es de este formulario no habría nada que mostrar: es un fallo
      if (hayErroresCuenta(errores)) return { ok: false, errores }
    }
    return { ok: false, errores: {}, motivo: 'fallo' }
  }
}
