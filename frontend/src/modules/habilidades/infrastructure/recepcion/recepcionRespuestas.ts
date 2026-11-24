import {
  guardarForma,
  guardarHistorias,
  guardarProfundizacion,
  guardarTareas,
  prepararCierre,
  type ErroresGuardarProfundizacion,
  type ResultadoCierre,
  type ResultadoGuardar,
} from '../../application/respuestas'
import type { ErroresForma } from '../../domain/forma'
import type { ErroresHistorias } from '../../domain/historias'
import type { RespuestasRepository } from '../../domain/RespuestasRepository'
import { crearLimitador } from '@/shared/lib/limitadorPeticiones'
import { leerForma, leerHistorias, leerMarcas, leerProfundizacion } from '../mappers/respuestasSchema'

// Lo que hace el servidor al recibir lo que la persona cuenta en cada paso: limita los intentos repetidos de un mismo
// cliente, comprueba la forma de lo recibido y llama al caso de uso. El repositorio lo pone quien llama (composition), y
// `clienteId` identifica a quien envía. Se guarda a menudo (cada paso, y de nuevo al volver atrás), por eso el límite es amplio.
const limiteRespuestas = crearLimitador({ maximo: 80, ventanaMs: 10 * 60 * 1000 })

const demasiados = { ok: false, errores: {}, motivo: 'limite' } as const
const malformado = { ok: false, errores: {}, motivo: 'fallo' } as const

export async function recibirTareas(repositorio: RespuestasRepository, entrada: unknown, clienteId: string): Promise<ResultadoGuardar> {
  if (!limiteRespuestas.permitir(clienteId)) return demasiados
  const datos = leerMarcas(entrada)
  return datos ? await guardarTareas(repositorio, datos) : malformado
}

export async function recibirProfundizacion(
  repositorio: RespuestasRepository,
  entrada: unknown,
  clienteId: string,
): Promise<ResultadoGuardar<ErroresGuardarProfundizacion>> {
  if (!limiteRespuestas.permitir(clienteId)) return demasiados
  const datos = leerProfundizacion(entrada)
  return datos ? await guardarProfundizacion(repositorio, datos.habilidad, datos.respuestas) : malformado
}

export async function recibirHistorias(repositorio: RespuestasRepository, entrada: unknown, clienteId: string): Promise<ResultadoGuardar<ErroresHistorias>> {
  if (!limiteRespuestas.permitir(clienteId)) return demasiados
  const datos = leerHistorias(entrada)
  return datos ? await guardarHistorias(repositorio, datos) : malformado
}

export async function recibirForma(repositorio: RespuestasRepository, entrada: unknown, clienteId: string): Promise<ResultadoGuardar<ErroresForma>> {
  if (!limiteRespuestas.permitir(clienteId)) return demasiados
  const datos = leerForma(entrada)
  return datos ? await guardarForma(repositorio, datos) : malformado
}

export async function recibirCierre(repositorio: RespuestasRepository, clienteId: string): Promise<ResultadoCierre | { ok: false; motivo: 'limite' }> {
  if (!limiteRespuestas.permitir(clienteId)) return { ok: false, motivo: 'limite' }
  return await prepararCierre(repositorio)
}
