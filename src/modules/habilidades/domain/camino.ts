// Cómo puede empezar una persona a armar el perfil de lo que sabe hacer: con lo que ya tiene escrito, o desde cero.

export const caminos = ['escritas', 'cero'] as const
export type Camino = (typeof caminos)[number]

/** Con cuál arranca marcado: el que siempre funciona y el que recomendamos */
export const caminoPorDefecto: Camino = 'cero'

/**
 * Cuáles se pueden elegir. «escritas» (subir un PDF o pegar enlaces) necesita algo que lo lea y lo analice; sin eso, el
 * camino sigue ahí pero apagado.
 */
export function caminosDisponibles({ analisisDisponible }: { analisisDisponible: boolean }): readonly Camino[] {
  return analisisDisponible ? caminos : [caminoPorDefecto]
}

/** Cuántos pasos tiene el recorrido para armar el perfil de habilidades: elegir cómo empezar, qué has hecho, más de lo que haces, tus historias y tu forma de emprender */
export const PASOS_TOTAL = 5
