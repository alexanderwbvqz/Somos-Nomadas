import { guardarBienvenida, type ResultadoBienvenida } from '../../application/guardarBienvenida'
import type { PerfilRepository } from '../../domain/PerfilRepository'
import { crearLimitador } from '@/shared/lib/limitadorPeticiones'
import { leerDatosBienvenida } from '../mappers/perfilSchema'

// Lo que hace el servidor al recibir la bienvenida: limita los intentos repetidos de un mismo cliente, comprueba la
// forma de lo recibido y llama al caso de uso. El repositorio lo pone quien llama (composition).
const limiteBienvenida = crearLimitador({ maximo: 20, ventanaMs: 10 * 60 * 1000 })

export async function recibirBienvenida(repositorio: PerfilRepository, entrada: unknown, clienteId: string): Promise<ResultadoBienvenida> {
  if (!limiteBienvenida.permitir(clienteId)) return { ok: false, errores: {}, motivo: 'limite' }
  const datos = leerDatosBienvenida(entrada)
  if (!datos) return { ok: false, errores: {}, motivo: 'fallo' }
  return await guardarBienvenida(repositorio, datos)
}
