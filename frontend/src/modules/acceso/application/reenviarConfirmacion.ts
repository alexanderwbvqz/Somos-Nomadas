import type { CuentaRepository } from '../domain/CuentaRepository'
import { IDIOMA_DEL_CORREO_POR_DEFECTO, type IdiomaDelCorreo } from '../domain/confirmacion'
import { ErrorDeLimite } from '../domain/errores'
import { correoEsValido, normalizarCorreo } from '../domain/cuenta'

export type ResultadoReenvio = { ok: true } | { ok: false; motivo: 'limite' | 'fallo' }

// Vuelve a mandar el enlace de confirmación. Siempre responde igual exista o no la cuenta.
export async function reenviarConfirmacion(
  repositorio: CuentaRepository,
  correo: string,
  idioma: IdiomaDelCorreo = IDIOMA_DEL_CORREO_POR_DEFECTO,
): Promise<ResultadoReenvio> {
  const limpio = normalizarCorreo(correo)
  if (!correoEsValido(limpio)) return { ok: false, motivo: 'fallo' }

  try {
    await repositorio.reenviarConfirmacion(limpio, idioma)
    return { ok: true }
  } catch (error) {
    return { ok: false, motivo: error instanceof ErrorDeLimite ? 'limite' : 'fallo' }
  }
}
