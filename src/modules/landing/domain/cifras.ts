export type ClaveCifra =
  | 'capitalRiesgo'
  | 'fundadoresSolos'
  | 'equipoInadecuado'
  | 'capitalEquipoCompleto'
  | 'capitalMentores'
  | 'registrados'

/** porcentaje: "75 %"; veces: "7×"; mas: "75+" */
export type UnidadCifra = 'porcentaje' | 'veces' | 'mas'

export type Cifra = {
  clave: ClaveCifra
  valor: number
  unidad: UnidadCifra
  /** Cifra con la que se compara, si la frase lo pide (se inserta como {comparado}) */
  comparadoCon?: number
  fuente: string
  /** Fecha del dato (AAAA-MM-DD); si existe se muestra como mes y año junto a la fuente */
  fecha?: string
}

// Datos reales con fuente (no son de ejemplo).
// PENDIENTE: contrastar cada cifra con la fuente original antes de publicar.
// - Ghosh (2012): lo reporta prensa secundaria; la NVCA da 25-30 % por otra definición de fracaso.
// - Carta (2024): compara cuotas de empresas, no tasas de éxito.
// - CB Insights: otras fuentes citan 14 % en lugar de 23 %.
// - Startup Genome (2011): unas 650 startups; las cifras salen de reseñas, no del informe.
// - Registrados: dato del documento de negocio a 6 de noviembre de 2026; actualizar.
export const cifras: Cifra[] = [
  { clave: 'capitalRiesgo', valor: 75, unidad: 'porcentaje', fuente: 'Shikhar Ghosh, Harvard Business School, 2012' },
  { clave: 'fundadoresSolos', valor: 17, unidad: 'porcentaje', comparadoCon: 35, fuente: 'Carta, 2024' },
  { clave: 'equipoInadecuado', valor: 23, unidad: 'porcentaje', fuente: 'CB Insights' },
  { clave: 'capitalEquipoCompleto', valor: 30, unidad: 'porcentaje', fuente: 'Startup Genome, 2011' },
  { clave: 'capitalMentores', valor: 7, unidad: 'veces', fuente: 'Startup Genome, 2011' },
  { clave: 'registrados', valor: 75, unidad: 'mas', fuente: 'Nómadas', fecha: '2026-11-06' },
]
