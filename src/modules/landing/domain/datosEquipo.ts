export type ClaveDatoEquipo = 'capitalRiesgo' | 'fundadoresSolos' | 'equipoInadecuado'

export type DatoEquipo = {
  clave: ClaveDatoEquipo
  porcentaje: number
  /** Cifra con la que se compara, si la frase lo pide (se inserta como {comparado}) */
  comparadoCon?: number
  fuente: string
}

// Datos reales con fuente (no son de ejemplo).
// PENDIENTE: contrastar cada cifra con la fuente original antes de publicar.
// - Ghosh (2012): lo reporta prensa secundaria; la NVCA da 25-30 % por otra definición de fracaso.
// - Carta (2024): compara cuotas de empresas, no tasas de éxito.
// - CB Insights: otras fuentes citan 14 % en lugar de 23 %.
export const datosEquipo: DatoEquipo[] = [
  { clave: 'capitalRiesgo', porcentaje: 75, fuente: 'Shikhar Ghosh, Harvard Business School, 2012' },
  { clave: 'fundadoresSolos', porcentaje: 17, comparadoCon: 35, fuente: 'Carta, 2024' },
  { clave: 'equipoInadecuado', porcentaje: 23, fuente: 'CB Insights' },
]
