// Cómo puede empezar una persona a armar el perfil de lo que sabe hacer: con lo que ya tiene escrito, o desde cero.

export const caminos = ['escritas', 'cero'] as const
export type Camino = (typeof caminos)[number]

/** Con cuál arranca marcado: el que funciona hoy y el que recomendamos */
export const caminoPorDefecto: Camino = 'cero'

// «escritas» (subir un PDF o pegar enlaces) necesita un servidor que lo lea y lo analice, y todavía no existe
const disponibles: readonly Camino[] = ['cero']

export function estaDisponible(camino: Camino): boolean {
  return disponibles.includes(camino)
}

/** Cuántos pasos tiene el recorrido para armar el perfil de habilidades (propuesta, pendiente de definir cada uno) */
export const PASOS_TOTAL = 6
