export const areasMatch = ['tecnologia', 'marketing', 'operaciones', 'finanzas'] as const
export type ClaveArea = (typeof areasMatch)[number]

// Regla del match (documento de negocio): hasta 3 personas de cada área complementaria
// y 1 de la misma área de quien consulta, hasta 10 conexiones en total.
export const CONEXIONES_POR_AREA_COMPLEMENTARIA = 3
export const CONEXIONES_DE_LA_MISMA_AREA = 1

/** Conexiones que se muestran por área para una persona de `propia` */
export function conexionesPorArea(propia: ClaveArea): Record<ClaveArea, number> {
  return {
    tecnologia: propia === 'tecnologia' ? CONEXIONES_DE_LA_MISMA_AREA : CONEXIONES_POR_AREA_COMPLEMENTARIA,
    marketing: propia === 'marketing' ? CONEXIONES_DE_LA_MISMA_AREA : CONEXIONES_POR_AREA_COMPLEMENTARIA,
    operaciones: propia === 'operaciones' ? CONEXIONES_DE_LA_MISMA_AREA : CONEXIONES_POR_AREA_COMPLEMENTARIA,
    finanzas: propia === 'finanzas' ? CONEXIONES_DE_LA_MISMA_AREA : CONEXIONES_POR_AREA_COMPLEMENTARIA,
  }
}

export function totalConexiones(propia: ClaveArea): number {
  return areasMatch.reduce((suma, area) => suma + conexionesPorArea(propia)[area], 0)
}

/** Primera área distinta de la propia: de ahí sale la conexión de ejemplo */
export function areaDeEjemplo(propia: ClaveArea): ClaveArea {
  return areasMatch.find((area) => area !== propia) ?? propia
}
