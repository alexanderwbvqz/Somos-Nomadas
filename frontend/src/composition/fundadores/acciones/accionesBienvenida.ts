'use server'

import type { ResultadoBienvenida } from '@/modules/fundadores/application/guardarBienvenida'
import { recibirBienvenida } from '@/modules/fundadores/infrastructure/recepcion/recepcionBienvenida'
import { identificarCliente } from '@/shared/lib/identificarCliente'
import { crearBienvenidaRepository } from '../fabricas/bienvenida'

// Acción de servidor que llama el formulario de bienvenida.
// Aquí solo se juntan las piezas: el adaptador (fábrica), quién envía y lo que hace el módulo con lo recibido.
export async function guardarBienvenidaAccion(entrada: unknown): Promise<ResultadoBienvenida> {
  return await recibirBienvenida(crearBienvenidaRepository(), entrada, await identificarCliente())
}
