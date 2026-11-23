// De lo que la persona marcó y contó, sale qué habilidades tiene y de qué área es. Es un cálculo sencillo, que se puede
// explicar y probar: cada habilidad suma sus puntos a su área. La inteligencia artificial, más adelante, lo afina con lo
// que la persona escribe; no lo sustituye.

import { areaDe, areas, habilidades, type AreaId, type HabilidadId } from './catalogo'
import { frecuencias, puntosDe, type Frecuencia, type Puntos, type TiempoPractica } from './puntos'

/** Las tareas que marcó, con cuántas veces la hizo; solo salen las marcadas */
export type Marcas = Partial<Record<HabilidadId, Frecuencia>>
/** Cuánto tiempo lleva con cada una de sus habilidades más fuertes */
export type Tiempos = Partial<Record<HabilidadId, TiempoPractica>>

/** Cuántas habilidades se tienen en cuenta como máximo */
export const MAX_HABILIDADES = 6
/** Cuántas son «las más fuertes», las que se profundizan y las que desempatan */
export const CANTIDAD_FUERTES = 3

/** Las habilidades marcadas, de más a menos veces hechas; con las mismas veces, en el orden del catálogo */
export function ordenarPorFuerza(marcas: Marcas): HabilidadId[] {
  const fuerza = (habilidad: HabilidadId) => {
    const frecuencia = marcas[habilidad]
    return frecuencia === undefined ? -1 : frecuencias.indexOf(frecuencia)
  }
  return habilidades.filter((habilidad) => fuerza(habilidad) >= 0).sort((a, b) => fuerza(b) - fuerza(a))
}

export function habilidadesMasFuertes(marcas: Marcas): HabilidadId[] {
  return ordenarPorFuerza(marcas).slice(0, CANTIDAD_FUERTES)
}

export type HabilidadPuntuada = {
  habilidad: HabilidadId
  frecuencia: Frecuencia
  puntos: Puntos
  /** Si no se sabe cuánto tiempo lleva con ella */
  estimado: boolean
}

/** Las habilidades que cuentan (hasta el máximo) con sus puntos */
export function puntuar(marcas: Marcas, tiempos: Tiempos): HabilidadPuntuada[] {
  return ordenarPorFuerza(marcas)
    .slice(0, MAX_HABILIDADES)
    .flatMap((habilidad) => {
      const frecuencia = marcas[habilidad]
      return frecuencia === undefined ? [] : [{ habilidad, frecuencia, ...puntosDe(frecuencia, tiempos[habilidad]) }]
    })
}

export type ResultadoArea = {
  /** Las cuatro áreas de más a menos puntos, con su porcentaje (redondeado: puede sumar 99 o 101) */
  reparto: { area: AreaId; porcentaje: number }[]
  /** El área de la persona; si hay un empate que no se rompe, las dos o más que empatan */
  areas: AreaId[]
  /** Hay empate y no lo eligió la persona: se muestran varias */
  mixto: boolean
}

/**
 * Suma los puntos de cada habilidad a su área. Si dos o más áreas empatan en puntos, gana la que más pese entre las tres
 * habilidades con más puntos; si sigue el empate, se devuelven todas las que empatan. Lo que elige la persona manda
 * sobre el cálculo. Sin habilidades no hay resultado.
 */
export function calcularArea(puntuadas: HabilidadPuntuada[], elegida?: AreaId): ResultadoArea | undefined {
  if (puntuadas.length === 0) return undefined

  const suma: Record<AreaId, number> = { tecnologia: 0, ventasMarketing: 0, finanzas: 0, operaciones: 0 }
  for (const puntuada of puntuadas) suma[areaDe[puntuada.habilidad]] += puntuada.puntos
  const total = areas.reduce((acumulado, area) => acumulado + suma[area], 0)

  const reparto = [...areas]
    .sort((a, b) => suma[b] - suma[a])
    .map((area) => ({ area, porcentaje: Math.round((suma[area] / total) * 100) }))

  if (elegida !== undefined) return { reparto, areas: [elegida], mixto: false }

  const maximo = Math.max(...areas.map((area) => suma[area]))
  let empatadas = areas.filter((area) => suma[area] === maximo)
  if (empatadas.length > 1) {
    const fuertes = [...puntuadas].sort((a, b) => b.puntos - a.puntos).slice(0, CANTIDAD_FUERTES)
    const peso = (area: AreaId) =>
      fuertes.filter((puntuada) => areaDe[puntuada.habilidad] === area).reduce((acumulado, puntuada) => acumulado + puntuada.puntos, 0)
    const mejor = Math.max(...empatadas.map(peso))
    empatadas = empatadas.filter((area) => peso(area) === mejor)
  }
  return { reparto, areas: empatadas, mixto: empatadas.length > 1 }
}
