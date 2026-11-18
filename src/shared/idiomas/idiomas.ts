export const idiomas = ['es', 'en', 'pt'] as const
export type Idioma = (typeof idiomas)[number]
export const idiomaPorDefecto: Idioma = 'es'

export function esIdioma(valor: string): valor is Idioma {
  return (idiomas as readonly string[]).includes(valor)
}
