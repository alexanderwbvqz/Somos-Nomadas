import type { ClaveArea } from './match'

// Una historia de personas que se complementaron y construyeron algo juntas, tal como se muestra en la landing: ya armada y con
// los textos en el idioma pedido. Los datos son editoriales: cada historia tiene que poder comprobarse en su fuente.

export type PersonaHistoria = {
  /** De una a tres letras; en vez de la foto */
  iniciales: string
  nombre: string
  /** El área de Nómadas a la que más se parece lo que aportó; decide el color de su círculo */
  area: ClaveArea
  /** Lo que aportó, en pocas palabras. Por ejemplo «Producto y ventas» */
  aporte: string
}

/** La frase destacada, con una parte en cursiva: `inicio` + `resaltado` + `fin` */
export type FraseHistoria = { inicio: string; resaltado: string; fin: string }

export type FuenteHistoria = { texto: string; href: string }

export type Historia = {
  /** La misma en todos los idiomas: sirve para identificarla */
  clave: string
  nombre: string
  anio: number
  /** El área que da el color a la sección mientras se ve esta historia */
  areaFondo: ClaveArea
  /** Por ejemplo «Ingeniería + Ventas» */
  combinacion: string
  frase: FraseHistoria
  personas: PersonaHistoria[]
  parrafos: string[]
  fuente: FuenteHistoria
}
