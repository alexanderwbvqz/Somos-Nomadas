'use server'

import { headers } from 'next/headers'
import type { ResultadoPostulacion } from '@/modules/aliados/application/enviarPostulacion'
import { recibirPostulacion } from './postulacionServidor'

// Acción de servidor que llama el formulario de postulación de aliados.
export async function enviarPostulacionAccion(entrada: unknown): Promise<ResultadoPostulacion> {
  const cabeceras = await headers()
  const clienteId = cabeceras.get('x-forwarded-for')?.split(',')[0]?.trim() || cabeceras.get('x-real-ip') || 'desconocido'
  return await recibirPostulacion(entrada, clienteId)
}
