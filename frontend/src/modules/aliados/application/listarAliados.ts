import type { Aliado } from '../domain/Aliado'
import type { AliadoRepository } from '../domain/AliadoRepository'

export function listarAliados(repositorio: AliadoRepository): Promise<Aliado[]> {
  return repositorio.listarAliados()
}
