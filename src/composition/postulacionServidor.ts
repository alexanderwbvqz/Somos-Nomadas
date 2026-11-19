import { enviarPostulacion, type ResultadoPostulacion } from '@/modules/aliados/application/enviarPostulacion'
import { leerDatosPostulacion } from '@/modules/aliados/infrastructure/mappers/postulacionSchema'
import { crearLimitador } from '@/shared/lib/limitadorPeticiones'
import { crearPostulacionRepository } from './fabricas/postulaciones'

// Como mucho 5 envíos cada 10 minutos por cliente
const limitador = crearLimitador({ maximo: 5, ventanaMs: 10 * 60 * 1000 })

/**
 * Lo que hace el servidor al recibir una postulación: limita los envíos repetidos de un mismo cliente,
 * comprueba la forma de lo recibido y valida y guarda con el caso de uso. `clienteId` identifica a quien envía.
 */
export async function recibirPostulacion(entrada: unknown, clienteId: string): Promise<ResultadoPostulacion> {
  if (!limitador.permitir(clienteId)) return { ok: false, errores: {}, motivo: 'limite' }
  const datos = leerDatosPostulacion(entrada)
  if (!datos) return { ok: false, errores: {}, motivo: 'fallo' }
  return await enviarPostulacion(crearPostulacionRepository(), datos)
}
