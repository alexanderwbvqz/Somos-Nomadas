import type { CuentaRepository } from '../domain/CuentaRepository'
import { LIMITES_CUENTA } from '../domain/cuenta'
import { esCorreoValido } from '@/modules/aliados/domain/postulacion'

export type ResultadoReenvio = { ok: true } | { ok: false; motivo: 'limite' | 'fallo' }

// Vuelve a mandar el enlace de confirmación. Siempre responde igual exista o no la cuenta.
export async function reenviarConfirmacion(repositorio: CuentaRepository, correo: string): Promise<ResultadoReenvio> {
  const limpio = correo.trim().toLowerCase()
  if (limpio.length > LIMITES_CUENTA.correo || !esCorreoValido(limpio)) return { ok: false, motivo: 'fallo' }

  try {
    await repositorio.reenviarConfirmacion(limpio)
    return { ok: true }
  } catch {
    return { ok: false, motivo: 'fallo' }
  }
}
