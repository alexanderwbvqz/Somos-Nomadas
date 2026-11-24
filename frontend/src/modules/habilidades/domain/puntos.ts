// Cuánto domina una persona una habilidad, en puntos del 1 al 5. Sale de dos cosas:
//  - cuántas veces hizo la tarea (siempre se sabe: es lo que marca en «Qué has hecho»);
//  - cuánto tiempo lleva con ella (solo se pregunta en las habilidades más fuertes).
// Sin el tiempo el nivel es estimado y llega como máximo a 3.

export const frecuencias = ['unaVez', 'variasVeces', 'esMiTrabajo'] as const
export type Frecuencia = (typeof frecuencias)[number]

export const tiemposPractica = ['menosDeUnAno', 'unoATresAnos', 'tresACincoAnos', 'masDeCincoAnos'] as const
export type TiempoPractica = (typeof tiemposPractica)[number]

export type Puntos = 1 | 2 | 3 | 4 | 5

const bonusPorTiempo: Record<TiempoPractica, 0 | 1 | 2> = {
  menosDeUnAno: 0,
  unoATresAnos: 1,
  tresACincoAnos: 1,
  masDeCincoAnos: 2,
}

export function esFrecuencia(valor: unknown): valor is Frecuencia {
  return typeof valor === 'string' && (frecuencias as readonly string[]).includes(valor)
}

export function esTiempoPractica(valor: unknown): valor is TiempoPractica {
  return typeof valor === 'string' && (tiemposPractica as readonly string[]).includes(valor)
}

/** Los puntos de una habilidad y si son una estimación (porque no se sabe cuánto tiempo lleva con ella) */
export function puntosDe(frecuencia: Frecuencia, tiempo?: TiempoPractica): { puntos: Puntos; estimado: boolean } {
  const base = 1 + frecuencias.indexOf(frecuencia)
  const bonus = tiempo === undefined ? 0 : bonusPorTiempo[tiempo]
  return { puntos: (base + bonus) as Puntos, estimado: tiempo === undefined }
}
