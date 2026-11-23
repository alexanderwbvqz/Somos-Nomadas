import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { LIMITES_MATERIAL, type CodigoErrorMaterial } from '../../domain/material'
import type { TextosHabilidades } from '../../language/tipos'

const MEGA = 1024 * 1024

/** El mensaje, en el idioma de la persona, de un error del material; undefined si no hay error */
export function mensajeDeErrorMaterial(textos: TextosHabilidades['escritas'], codigo: CodigoErrorMaterial | undefined): string | undefined {
  if (!codigo) return undefined
  return rellenarPlantilla(textos.errores[codigo], { max: LIMITES_MATERIAL.pdfBytes / MEGA })
}
