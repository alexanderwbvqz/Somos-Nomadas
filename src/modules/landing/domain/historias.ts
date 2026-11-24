// Qué historias se pueden publicar en la landing. Una historia sin fuentes, sin texto o sin personas no sale: lo que no se puede
// comprobar no se enseña. La regla es una sola y la usa el caso de uso, sea cual sea el adaptador que traiga las historias.

import { normalizarEnlace } from '@/modules/perfil/domain/evidencia'
import type { Historia } from './Historia'

export const LIMITES_HISTORIAS = { personas: { min: 2, max: 3 }, fuentes: { min: 1, max: 3 }, iniciales: 3, anioMinimo: 1800 } as const

const hayTexto = (texto: string) => texto.trim() !== ''

/** `anioActual` lo pone quien llama: el dominio no mira el reloj */
export function historiaPublicable(historia: Historia, anioActual: number): boolean {
  const { personas, fuentes, iniciales } = LIMITES_HISTORIAS
  return (
    hayTexto(historia.clave) &&
    hayTexto(historia.nombre) &&
    hayTexto(historia.combinacion) &&
    Number.isInteger(historia.anio) &&
    historia.anio >= LIMITES_HISTORIAS.anioMinimo &&
    historia.anio <= anioActual &&
    hayTexto(historia.frase.resaltado) &&
    historia.parrafos.some(hayTexto) &&
    historia.personas.length >= personas.min &&
    historia.personas.length <= personas.max &&
    historia.personas.every((persona) => hayTexto(persona.iniciales) && persona.iniciales.trim().length <= iniciales && hayTexto(persona.nombre) && hayTexto(persona.aporte)) &&
    historia.fuentes.length >= fuentes.min &&
    historia.fuentes.length <= fuentes.max &&
    historia.fuentes.every((fuente) => hayTexto(fuente.texto) && normalizarEnlace(fuente.href) !== undefined)
  )
}

/** Las publicables, en su orden; si dos tienen la misma clave se queda la primera */
export function historiasPublicables(historias: readonly Historia[], anioActual: number): Historia[] {
  const vistas = new Set<string>()
  return historias.filter((historia) => {
    if (vistas.has(historia.clave) || !historiaPublicable(historia, anioActual)) return false
    vistas.add(historia.clave)
    return true
  })
}
