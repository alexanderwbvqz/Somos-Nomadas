import type { TipoAliado } from '../../domain/Aliado'

// Color de cada tipo de aliado (los mismos tonos de las áreas en el resto de la web), por token
export const colorTipoAliado: Record<TipoAliado, string> = {
  mentores: 'bg-degradado-amarillo',
  organizadores: 'bg-degradado-azul',
  estrategicos: 'bg-degradado-durazno',
}
