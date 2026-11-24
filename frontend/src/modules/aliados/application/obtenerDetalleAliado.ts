import type { Aliado } from '../domain/Aliado'
import type { AliadoRepository } from '../domain/AliadoRepository'
import { aliadosSimilares } from '../domain/detalle'

export type DetalleAliado = {
  aliado: Aliado
  /** Otros aliados del mismo tipo, para seguir explorando */
  similares: Aliado[]
}

/** El aliado con ese id y sus similares; undefined si no existe */
export async function obtenerDetalleAliado(repositorio: AliadoRepository, id: string): Promise<DetalleAliado | undefined> {
  const todos = await repositorio.listarAliados()
  const aliado = todos.find((candidato) => candidato.id === id)
  return aliado ? { aliado, similares: aliadosSimilares(todos, aliado) } : undefined
}
