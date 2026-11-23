import type { PerfilRepository } from '../domain/PerfilRepository'
import {
  hayErroresTrayectoria,
  limpiarTrayectoria,
  validarTrayectoria,
  type EntradaTrayectoriaForm,
  type ErroresTrayectoria,
} from '../domain/trayectoria'
import type { ResultadoGuardar } from './resultado'

/**
 * «Trayectoria»: valida otra vez, en el servidor, la lista entera que mandó el navegador; lo guardado la sustituye, y una lista
 * vacía la borra. El año actual lo da quien llama.
 */
export async function guardarTrayectoria(
  repositorio: PerfilRepository,
  entradas: readonly EntradaTrayectoriaForm[],
  anioActual: number,
): Promise<ResultadoGuardar<ErroresTrayectoria>> {
  const errores = validarTrayectoria(entradas, anioActual)
  if (hayErroresTrayectoria(errores)) return { ok: false, errores }

  try {
    await repositorio.guardarTrayectoria(limpiarTrayectoria(entradas))
    return { ok: true }
  } catch {
    return { ok: false, errores: { entradas: {} }, motivo: 'fallo' }
  }
}
