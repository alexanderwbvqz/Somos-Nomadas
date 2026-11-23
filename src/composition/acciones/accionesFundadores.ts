'use server'

import type { ResultadoBienvenida } from '@/modules/fundadores/application/guardarBienvenida'
import { recibirBienvenida } from '@/modules/fundadores/infrastructure/recepcion/recepcionPerfil'
import { identificarCliente } from '@/shared/lib/identificarCliente'
import { crearPerfilRepository } from '../fabricas/perfiles'

// Acción de servidor que llama el formulario de bienvenida.
// Aquí solo se juntan las piezas: el adaptador (fábrica), quién envía y lo que hace el módulo con lo recibido.
export async function guardarBienvenidaAccion(entrada: unknown): Promise<ResultadoBienvenida> {
  return await recibirBienvenida(crearPerfilRepository(), entrada, await identificarCliente())
}
