import type { DatosPostulacion, ErroresPostulacion } from '@/modules/aliados/domain/postulacion'
import type { TextosPostulacion } from '@/modules/aliados/language/tipos'

export type CambiarDato = <K extends keyof DatosPostulacion>(clave: K, valor: DatosPostulacion[K]) => void

/** Lo que reciben los componentes de cada paso */
export type PropsPaso = {
  textos: TextosPostulacion
  datos: DatosPostulacion
  errores: ErroresPostulacion
  cambiar: CambiarDato
}
