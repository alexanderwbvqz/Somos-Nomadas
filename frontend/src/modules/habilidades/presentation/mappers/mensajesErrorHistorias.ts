import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { LIMITES_HISTORIAS, type CodigoErrorHistorias } from '../../domain/historias'
import type { TextosHabilidades } from '../../language/tipos'

/** El mensaje, en el idioma de la persona, de un error de «Tus historias»; undefined si no hay error */
export function mensajeDeErrorHistorias(textos: TextosHabilidades['historias'], codigo: CodigoErrorHistorias | undefined): string | undefined {
  if (!codigo) return undefined
  switch (codigo) {
    case 'textoLargo':
      return rellenarPlantilla(textos.errores.textoLargo, { max: LIMITES_HISTORIAS.texto })
    case 'demasiadosSectores':
      return rellenarPlantilla(textos.errores.demasiadosSectores, { max: LIMITES_HISTORIAS.sectoresMax })
    case 'faltaPermiso':
      return textos.errores.faltaPermiso
    case 'sectorInvalido':
      return textos.errores.sectorInvalido
  }
}
