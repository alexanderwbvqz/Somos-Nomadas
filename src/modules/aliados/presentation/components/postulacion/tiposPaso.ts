import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { LIMITES, type CodigoError, type DatosPostulacion, type ErroresPostulacion } from '@/modules/aliados/domain/postulacion'
import type { TextosPostulacion } from '@/modules/aliados/language/tipos'

export type CambiarDato = <K extends keyof DatosPostulacion>(clave: K, valor: DatosPostulacion[K]) => void

/** Lo que reciben los componentes de cada paso */
export type PropsPaso = {
  textos: TextosPostulacion
  datos: DatosPostulacion
  errores: ErroresPostulacion
  cambiar: CambiarDato
}

/** El mensaje, en el idioma de la persona, de un error de campo; undefined si no hay error */
export function mensajeDeError(textos: TextosPostulacion, codigo: CodigoError | undefined): string | undefined {
  if (!codigo) return undefined
  return rellenarPlantilla(textos.errores[codigo], { min: LIMITES.palabrasMin, max: LIMITES.palabrasMax })
}
