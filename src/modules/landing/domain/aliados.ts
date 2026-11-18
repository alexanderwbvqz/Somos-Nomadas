// Los tres tipos de aliado del documento de negocio
export const tiposAliado = ['mentores', 'organizadores', 'estrategicos'] as const
export type TipoAliado = (typeof tiposAliado)[number]

export type Aliado = {
  nombre: string
  tipo: TipoAliado
  /** Ruta del logo en public/aliados/; si falta se muestra el nombre en texto */
  logoSrc?: string
}

// Quienes apoyan a Nómadas. Vacía hasta recibir los aliados reales: mientras no haya
// ninguno, no se muestra la franja ni el listado, y los tipos no llevan número de activos.
export const aliados: Aliado[] = []
