import type { BienvenidaRepository } from '../domain/BienvenidaRepository'
import {
  esPais,
  hayErroresBienvenida,
  limpiarBienvenida,
  validarBienvenida,
  type DatosBienvenida,
  type ErroresBienvenida,
} from '../domain/bienvenida'

export type ResultadoBienvenida =
  | { ok: true; nombre: string }
  | {
      ok: false
      /** Qué campos tienen problema; vacío si el fallo no es de los datos */
      errores: ErroresBienvenida
      /** limite: demasiados intentos seguidos; fallo: no se pudo guardar */
      motivo?: 'limite' | 'fallo'
    }

// Valida otra vez, en el servidor, lo que mandó el navegador; si todo está bien guarda la bienvenida.
export async function guardarBienvenida(repositorio: BienvenidaRepository, datos: DatosBienvenida): Promise<ResultadoBienvenida> {
  const errores = validarBienvenida(datos)
  if (hayErroresBienvenida(errores) || !esPais(datos.pais)) return { ok: false, errores }

  const perfil = limpiarBienvenida({ ...datos, pais: datos.pais })
  try {
    await repositorio.guardarBienvenida(perfil)
    return { ok: true, nombre: perfil.nombre }
  } catch {
    return { ok: false, errores: {}, motivo: 'fallo' }
  }
}
