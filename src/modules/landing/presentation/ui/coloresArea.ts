import type { ClaveArea } from '../../domain/match'

// Color de cada área, igual en el diagrama, el panel del match y los pilares. Una sola definición.
export const colorArea: Record<ClaveArea, string> = {
  tecnologia: 'bg-degradado-amarillo',
  marketing: 'bg-degradado-azul',
  operaciones: 'bg-degradado-durazno',
  finanzas: 'bg-primario/55',
}
