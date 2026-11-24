import type { Aliado } from './Aliado'

export interface AliadoRepository {
  /** Los aliados publicados (ya revisados por el equipo), en el orden en que se muestran */
  listarAliados(): Promise<Aliado[]>
}
