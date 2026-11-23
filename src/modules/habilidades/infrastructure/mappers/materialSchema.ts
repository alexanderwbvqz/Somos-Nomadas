import { z } from 'zod'
import { LIMITES_MATERIAL } from '../../domain/material'

// Frontera con lo que llega del navegador (un formulario con archivo): se comprueba la forma y se ponen topes generosos
// a cada texto. El control fino lo hace el dominio, que es el mismo que usa el formulario.
const holgura = 4
const enlace = z.string().max(LIMITES_MATERIAL.enlaceLargo * holgura)

const textosSchema = z.object({
  web: enlace,
  github: enlace,
  otro: enlace,
  aceptaAnalisis: z.enum(['true', 'false']),
})

export type MaterialRecibido = {
  web: string
  github: string
  otro: string
  aceptaAnalisis: boolean
  /** El archivo tal como llegó, sin haberlo leído; undefined si no se subió ninguno */
  archivo?: File
}

export function leerMaterial(entrada: unknown): MaterialRecibido | undefined {
  if (!(entrada instanceof FormData)) return undefined

  const resultado = textosSchema.safeParse({
    web: entrada.get('web') ?? '',
    github: entrada.get('github') ?? '',
    otro: entrada.get('otro') ?? '',
    aceptaAnalisis: entrada.get('aceptaAnalisis') ?? 'false',
  })
  if (!resultado.success) return undefined

  const pdf = entrada.get('pdf')
  // Un campo de archivo sin elegir llega como un archivo vacío y sin nombre
  const archivo = pdf instanceof File && !(pdf.name === '' && pdf.size === 0) ? pdf : undefined
  if (pdf !== null && !(pdf instanceof File)) return undefined

  const { aceptaAnalisis, ...enlaces } = resultado.data
  return { ...enlaces, aceptaAnalisis: aceptaAnalisis === 'true', archivo }
}
