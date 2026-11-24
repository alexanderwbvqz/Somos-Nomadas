'use server'

import type { ResultadoPostulacion } from '@/modules/aliados/application/enviarPostulacion'
import { recibirPostulacion } from '@/modules/aliados/infrastructure/recepcion/recepcionPostulacion'
import { identificarCliente } from '@/shared/lib/identificarCliente'
import { crearPostulacionRepository } from '../fabricas/postulaciones'

// Acción de servidor que llama el formulario de postulación de aliados.
export async function enviarPostulacionAccion(entrada: unknown): Promise<ResultadoPostulacion> {
  return await recibirPostulacion(crearPostulacionRepository(), entrada, await identificarCliente())
}
