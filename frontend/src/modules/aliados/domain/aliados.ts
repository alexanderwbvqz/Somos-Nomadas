import { tiposAliado, type TipoAliado } from './Aliado'

export type FiltroAliados = TipoAliado | 'todos'

export function esTipoAliado(valor: string | null | undefined): valor is TipoAliado {
  return (tiposAliado as readonly (string | null | undefined)[]).includes(valor)
}

/** Convierte un valor de la URL (?tipo=…) en un filtro válido; lo desconocido es "todos" */
export function filtroDesde(valor: string | null | undefined): FiltroAliados {
  return esTipoAliado(valor) ? valor : 'todos'
}

// Funcionan con cualquier cosa que tenga un tipo (un aliado o su versión para mostrar)
export function filtrarAliados<T extends { tipo: TipoAliado }>(aliados: T[], filtro: FiltroAliados): T[] {
  return filtro === 'todos' ? aliados : aliados.filter((aliado) => aliado.tipo === filtro)
}

export function contarPorTipo(aliados: { tipo: TipoAliado }[]): Record<TipoAliado, number> {
  const cuenta: Record<TipoAliado, number> = { mentores: 0, organizadores: 0, estrategicos: 0 }
  for (const aliado of aliados) cuenta[aliado.tipo] += 1
  return cuenta
}
