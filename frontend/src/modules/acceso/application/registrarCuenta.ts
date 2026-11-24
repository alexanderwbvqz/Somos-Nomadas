import type { CuentaRepository } from '../domain/CuentaRepository'
import {
  esRobotRegistro,
  hayErroresCuenta,
  limpiarRegistro,
  validarRegistro,
  type DatosRegistro,
  type ErroresRegistro,
} from '../domain/cuenta'

export type ResultadoRegistro =
  | { ok: true; correo: string }
  | {
      ok: false
      /** Qué campos tienen problema; vacío si el fallo no es de los datos */
      errores: ErroresRegistro
      /** limite: demasiados intentos seguidos; fallo: no se pudo completar */
      motivo?: 'limite' | 'fallo'
    }

// Valida otra vez, en el servidor, lo que mandó el navegador; si todo está bien crea la cuenta.
export async function registrarCuenta(repositorio: CuentaRepository, datos: DatosRegistro): Promise<ResultadoRegistro> {
  // Un robot rellena el campo trampa: se responde como si todo hubiera ido bien, sin crear nada
  if (esRobotRegistro(datos)) return { ok: true, correo: datos.correo.trim() }

  const errores = validarRegistro(datos)
  if (hayErroresCuenta(errores)) return { ok: false, errores }

  const cuenta = limpiarRegistro(datos)
  try {
    await repositorio.registrar(cuenta)
    return { ok: true, correo: cuenta.correo }
  } catch {
    return { ok: false, errores: {}, motivo: 'fallo' }
  }
}
