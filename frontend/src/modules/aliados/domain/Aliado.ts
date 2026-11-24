// Los tres tipos de aliado del documento de negocio
export const tiposAliado = ['mentores', 'organizadores', 'estrategicos'] as const
export type TipoAliado = (typeof tiposAliado)[number]

export type TipoRedAliado = 'linkedin' | 'instagram'
export type RedAliado = { tipo: TipoRedAliado; href: string }

/** Una cifra o dato breve del aliado, por ejemplo { valor: "12 años", etiqueta: "de experiencia" } */
export type DatoClave = { valor: string; etiqueta: string }

// Los textos que escribe el aliado o el equipo están en un solo idioma y no se traducen.
// Los datos de detalle son opcionales: la página muestra solo los que existen.
export type Aliado = {
  id: string
  nombre: string
  tipo: TipoAliado
  /** Texto corto de la tarjeta del listado y de la cabecera de su página */
  descripcion: string
  /** Ruta del logo en public/aliados/; si falta se muestra el nombre en texto */
  logoSrc?: string

  /** "Quién es": uno o varios párrafos */
  descripcionLarga: string[]
  datosClave: DatoClave[]
  /** Áreas en las que puede ayudar (etiquetas cortas) */
  areas: string[]
  /** Para qué tipo de equipos es, como frase completa ("Equipos que ya tienen…") */
  paraQuien?: string
  apoyos: string[]

  ciudad?: string
  sitioWeb?: string
  redes: RedAliado[]
  /** Fecha de ingreso a la red (AAAA-MM-DD) */
  enLaRedDesde?: string

  /** WhatsApp del aliado en formato internacional, sin "+" ni espacios. Es un dato personal si es de una persona:
   *  solo se publica con su consentimiento expreso. */
  whatsapp?: string
  /** Enlace a su agenda de citas (Calendly, Cal.com, Google Calendar…) */
  enlaceAgenda?: string
}
