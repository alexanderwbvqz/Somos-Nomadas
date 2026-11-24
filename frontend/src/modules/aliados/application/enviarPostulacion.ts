import type { PostulacionRepository } from '../domain/PostulacionRepository'
import {
  esRobot,
  hayErrores,
  limpiarPostulacion,
  validarPostulacion,
  type DatosPostulacion,
  type ErroresPostulacion,
} from '../domain/postulacion'

export type ResultadoPostulacion =
  | { ok: true }
  | {
      ok: false
      /** Qué campos tienen problema; vacío si el fallo no es de los datos */
      errores: ErroresPostulacion
      /** limite: demasiados envíos seguidos; fallo: no se pudo guardar */
      motivo?: 'limite' | 'fallo'
    }

// Valida otra vez, en el servidor, lo que mandó el navegador; si todo está bien lo guarda como pendiente de revisión.
export async function enviarPostulacion(repositorio: PostulacionRepository, datos: DatosPostulacion): Promise<ResultadoPostulacion> {
  // Un robot rellena el campo trampa: se responde como si todo hubiera ido bien, sin guardar nada
  if (esRobot(datos)) return { ok: true }

  const errores = validarPostulacion(datos)
  if (hayErrores(errores)) return { ok: false, errores }

  try {
    await repositorio.enviar(limpiarPostulacion(datos))
    return { ok: true }
  } catch {
    return { ok: false, errores: {}, motivo: 'fallo' }
  }
}
