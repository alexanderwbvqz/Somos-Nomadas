'use server'

import type { ResultadoPostulacion } from '@/modules/aliados/application/enviarPostulacion'
import { identificarCliente } from './identificarCliente'
import { recibirPostulacion } from './postulacionServidor'

// Acción de servidor que llama el formulario de postulación de aliados.
export async function enviarPostulacionAccion(entrada: unknown): Promise<ResultadoPostulacion> {
  return await recibirPostulacion(entrada, await identificarCliente())
}
