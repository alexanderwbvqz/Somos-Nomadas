'use server'

import type { ErroresGuardarProfundizacion, ResultadoCierre, ResultadoGuardar } from '@/modules/habilidades/application/respuestas'
import type { ErroresForma } from '@/modules/habilidades/domain/forma'
import type { ErroresHistorias } from '@/modules/habilidades/domain/historias'
import {
  recibirCierre,
  recibirForma,
  recibirHistorias,
  recibirProfundizacion,
  recibirTareas,
} from '@/modules/habilidades/infrastructure/recepcion/recepcionRespuestas'
import { identificarCliente } from '@/shared/lib/identificarCliente'
import { crearRespuestasRepository } from '../fabricas/respuestas'

// Acciones de servidor que llaman los pasos del recorrido de habilidades.
// Aquí solo se juntan las piezas: el adaptador (fábrica), quién envía y lo que hace el módulo con lo recibido.
export async function guardarTareasAccion(entrada: unknown): Promise<ResultadoGuardar> {
  return await recibirTareas(crearRespuestasRepository(), entrada, await identificarCliente())
}

export async function guardarProfundizacionAccion(entrada: unknown): Promise<ResultadoGuardar<ErroresGuardarProfundizacion>> {
  return await recibirProfundizacion(crearRespuestasRepository(), entrada, await identificarCliente())
}

export async function guardarHistoriasAccion(entrada: unknown): Promise<ResultadoGuardar<ErroresHistorias>> {
  return await recibirHistorias(crearRespuestasRepository(), entrada, await identificarCliente())
}

export async function guardarFormaAccion(entrada: unknown): Promise<ResultadoGuardar<ErroresForma>> {
  return await recibirForma(crearRespuestasRepository(), entrada, await identificarCliente())
}

export async function prepararCierreAccion(): Promise<ResultadoCierre | { ok: false; motivo: 'limite' }> {
  return await recibirCierre(crearRespuestasRepository(), await identificarCliente())
}
