import type { PerfilRepository } from '../domain/PerfilRepository'
import { hayErroresSobreMi, limpiarSobreMi, validarSobreMi, type ErroresSobreMi } from '../domain/sobreMi'
import type { ResultadoGuardar } from './resultado'

/** «Sobre mí»: valida otra vez, en el servidor, lo que mandó el navegador. Un texto vacío borra lo que había. */
export async function guardarSobreMi(repositorio: PerfilRepository, texto: string): Promise<ResultadoGuardar<ErroresSobreMi>> {
  const errores = validarSobreMi(texto)
  if (hayErroresSobreMi(errores)) return { ok: false, errores }

  try {
    await repositorio.guardarSobreMi(limpiarSobreMi(texto))
    return { ok: true }
  } catch {
    return { ok: false, errores: {}, motivo: 'fallo' }
  }
}
