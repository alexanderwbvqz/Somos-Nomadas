export const idiomas = ['es', 'en', 'pt'] as const
export type Idioma = (typeof idiomas)[number]
export const idiomaPorDefecto: Idioma = 'es'

// Cada idioma se nombra en su propio idioma, así que no se traduce
export const nombresIdiomas: Record<Idioma, string> = { es: 'Español', en: 'English', pt: 'Português' }

export function esIdioma(valor: string): valor is Idioma {
  return (idiomas as readonly string[]).includes(valor)
}
