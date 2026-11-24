import { enviarPostulacion, type ResultadoPostulacion } from '../../application/enviarPostulacion'
import type { PostulacionRepository } from '../../domain/PostulacionRepository'
import { crearLimitador } from '@/shared/lib/limitadorPeticiones'
import { leerDatosPostulacion } from '../mappers/postulacionSchema'

// Como mucho 5 envíos cada 10 minutos por cliente. El contador vive aquí, fuera de la función,
// para que se acumule entre una petición y otra.
const limitador = crearLimitador({ maximo: 5, ventanaMs: 10 * 60 * 1000 })

/**
 * Lo que hace el servidor al recibir una postulación: limita los envíos repetidos de un mismo cliente,
 * comprueba la forma de lo recibido y valida y guarda con el caso de uso. El repositorio lo pone quien llama
 * (composition) y `clienteId` identifica a quien envía.
 */
export async function recibirPostulacion(repositorio: PostulacionRepository, entrada: unknown, clienteId: string): Promise<ResultadoPostulacion> {
  if (!limitador.permitir(clienteId)) return { ok: false, errores: {}, motivo: 'limite' }
  const datos = leerDatosPostulacion(entrada)
  if (!datos) return { ok: false, errores: {}, motivo: 'fallo' }
  return await enviarPostulacion(repositorio, datos)
}
