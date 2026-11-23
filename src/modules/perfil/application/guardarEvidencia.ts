import { hayErroresEvidencia, limpiarEvidencia, validarEvidencia, type ErroresEvidencia } from '../domain/evidencia'
import type { PerfilRepository } from '../domain/PerfilRepository'
import type { ResultadoGuardar } from './resultado'

/** «Evidencia»: valida otra vez, en el servidor, la lista entera de enlaces; lo guardado la sustituye, y una lista vacía la borra. */
export async function guardarEvidencia(repositorio: PerfilRepository, enlaces: readonly string[]): Promise<ResultadoGuardar<ErroresEvidencia>> {
  const errores = validarEvidencia(enlaces)
  if (hayErroresEvidencia(errores)) return { ok: false, errores }

  try {
    await repositorio.guardarEvidencia(limpiarEvidencia(enlaces))
    return { ok: true }
  } catch {
    return { ok: false, errores: { enlaces: {} }, motivo: 'fallo' }
  }
}
