// Los tres tipos de aliado del documento de negocio
export const tiposAliado = ['mentores', 'organizadores', 'estrategicos'] as const
export type TipoAliado = (typeof tiposAliado)[number]

export type Aliado = {
  id: string
  nombre: string
  tipo: TipoAliado
  /** Texto corto que escribe el equipo (en el idioma en que lo redacta; no se traduce) */
  descripcion: string
  /** Ruta del logo en public/aliados/; si falta se muestra el nombre en texto */
  logoSrc?: string
}
