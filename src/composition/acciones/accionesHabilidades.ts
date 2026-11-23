'use server'

import type { ResultadoAnalisis } from '@/modules/habilidades/application/analizarMaterial'
import { recibirMaterial } from '@/modules/habilidades/infrastructure/recepcion/recepcionMaterial'
import { identificarCliente } from '@/shared/lib/identificarCliente'
import { crearAnalisisRepository } from '../fabricas/analisis'

// Acción de servidor que llama el formulario de subir o pegar lo que se tiene escrito.
// Aquí solo se juntan las piezas: el adaptador (fábrica), quién envía y lo que hace el módulo con lo recibido.
export async function analizarMaterialAccion(entrada: unknown): Promise<ResultadoAnalisis> {
  return await recibirMaterial(crearAnalisisRepository(), entrada, await identificarCliente())
}
