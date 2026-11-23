import { z } from 'zod'
import { habilidades, type HabilidadId } from '../../domain/catalogo'
import type { EntradaForma } from '../../domain/forma'
import { LIMITE_SOCIO_IDEAL } from '../../domain/forma'
import { LIMITES_HISTORIAS, sectores, type EntradaHistorias } from '../../domain/historias'
import type { Marcas } from '../../domain/perfilArea'
import { LIMITE_TEXTO, type RespuestasProfundizacion } from '../../domain/preguntas'
import { frecuencias } from '../../domain/puntos'

// Frontera con lo que llega del navegador: se comprueba la forma y se ponen topes generosos a cada texto (el control fino
// lo hace el dominio, que es el mismo que usa el formulario). Lo que no tiene la forma esperada se descarta entero.
const holgura = 4

const marcasSchema = z.object({ marcas: z.partialRecord(z.enum(habilidades), z.enum(frecuencias)) })

const profundizacionSchema = z.object({
  habilidad: z.enum(habilidades),
  respuestas: z
    .record(
      z.string().max(40),
      z.union([z.string().max(LIMITE_TEXTO * holgura), z.array(z.string().max(60)).max(20)]),
    )
    .refine((respuestas) => Object.keys(respuestas).length <= 20),
})

const historiasSchema = z.object({
  logro: z.string().max(LIMITES_HISTORIAS.texto * holgura),
  problemaDificil: z.string().max(LIMITES_HISTORIAS.texto * holgura),
  problemaMundo: z.string().max(LIMITES_HISTORIAS.texto * holgura),
  sectores: z.array(z.string().max(40)).max(sectores.length * 2),
  aceptaMostrar: z.boolean(),
})

const formaSchema = z.object({
  respuestas: z.record(z.string().max(40), z.string().max(40)).refine((respuestas) => Object.keys(respuestas).length <= 12),
  busca: z.array(z.string().max(40)).max(8),
  socioIdeal: z.string().max(LIMITE_SOCIO_IDEAL * holgura),
})

export function leerMarcas(entrada: unknown): Marcas | undefined {
  const resultado = marcasSchema.safeParse(entrada)
  return resultado.success ? resultado.data.marcas : undefined
}

export function leerProfundizacion(entrada: unknown): { habilidad: HabilidadId; respuestas: RespuestasProfundizacion } | undefined {
  const resultado = profundizacionSchema.safeParse(entrada)
  return resultado.success ? resultado.data : undefined
}

export function leerHistorias(entrada: unknown): EntradaHistorias | undefined {
  const resultado = historiasSchema.safeParse(entrada)
  return resultado.success ? resultado.data : undefined
}

export function leerForma(entrada: unknown): EntradaForma | undefined {
  const resultado = formaSchema.safeParse(entrada)
  return resultado.success ? resultado.data : undefined
}
