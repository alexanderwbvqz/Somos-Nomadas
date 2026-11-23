import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { LIMITES, type CodigoError } from '../../domain/postulacion'
import type { TextosPostulacion } from '../../language/tipos'

/** El mensaje, en el idioma de la persona, de un error de campo; undefined si no hay error */
export function mensajeDeError(textos: TextosPostulacion, codigo: CodigoError | undefined): string | undefined {
  if (!codigo) return undefined
  return rellenarPlantilla(textos.errores[codigo], { min: LIMITES.palabrasMin, max: LIMITES.palabrasMax })
}
