import { z } from 'zod'
import { LIMITES_EVIDENCIA } from '../../domain/evidencia'
import { LIMITE_SOBRE_MI } from '../../domain/sobreMi'
import { LIMITES_TRAYECTORIA, type EntradaTrayectoriaForm } from '../../domain/trayectoria'

// Frontera con lo que llega del navegador: se comprueba la forma y se ponen topes generosos a cada texto y a cada lista (el
// control fino lo hace el dominio, que es el mismo que usa el formulario). Lo que no tiene la forma esperada se descarta entero.
const holgura = 4

const sobreMiSchema = z.object({ texto: z.string().max(LIMITE_SOBRE_MI * holgura) })

const entradaTrayectoriaSchema = z.object({
  desde: z.string().max(8),
  hasta: z.string().max(8),
  rol: z.string().max(LIMITES_TRAYECTORIA.rol * holgura),
  donde: z.string().max(LIMITES_TRAYECTORIA.donde * holgura),
  que: z.string().max(LIMITES_TRAYECTORIA.que * holgura),
})
const trayectoriaSchema = z.object({ entradas: z.array(entradaTrayectoriaSchema).max(LIMITES_TRAYECTORIA.entradas * 2) })

const evidenciaSchema = z.object({ enlaces: z.array(z.string().max(LIMITES_EVIDENCIA.largo * 2)).max(LIMITES_EVIDENCIA.enlaces * 2) })

export function leerSobreMi(entrada: unknown): string | undefined {
  const resultado = sobreMiSchema.safeParse(entrada)
  return resultado.success ? resultado.data.texto : undefined
}

export function leerTrayectoria(entrada: unknown): EntradaTrayectoriaForm[] | undefined {
  const resultado = trayectoriaSchema.safeParse(entrada)
  return resultado.success ? resultado.data.entradas : undefined
}

export function leerEvidencia(entrada: unknown): string[] | undefined {
  const resultado = evidenciaSchema.safeParse(entrada)
  return resultado.success ? resultado.data.enlaces : undefined
}
