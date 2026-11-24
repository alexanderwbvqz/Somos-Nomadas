import type { TipoAliado } from '@/modules/aliados/domain/Aliado'

// Aliados que la landing destaca (franja del hero y listado de la sección de aliados).
// Es una selección propia de la landing; el listado completo vive en el módulo aliados.
export type AliadoDestacado = {
  nombre: string
  tipo: TipoAliado
  /** Ruta del logo en public/aliados/; si falta se muestra el nombre en texto */
  logoSrc?: string
}

// Vacía hasta recibir los aliados reales: mientras no haya ninguno, no se muestra la franja
// ni el listado, y los tipos no llevan número de activos.
export const aliados: AliadoDestacado[] = []
