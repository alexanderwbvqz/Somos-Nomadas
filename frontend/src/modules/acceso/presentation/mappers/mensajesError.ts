import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { LIMITES_CUENTA, type CodigoErrorCuenta } from '../../domain/cuenta'
import type { TextosAcceso } from '../../language/tipos'

type CampoConMensaje = 'correo' | 'clave'

/** El mensaje, en el idioma de la persona, del error de un campo; undefined si no hay error */
export function mensajeDeErrorCuenta(textos: TextosAcceso, campo: string, codigo: CodigoErrorCuenta | undefined): string | undefined {
  if (!codigo) return undefined
  const e = textos.errores
  switch (codigo) {
    case 'obligatorio':
      return e[campo as CampoConMensaje]
    case 'correoInvalido':
      return e.correoInvalido
    case 'claveCorta':
      return rellenarPlantilla(e.claveCorta, { min: LIMITES_CUENTA.claveMin })
    case 'claveLarga':
      return e.claveLarga
    case 'claveSinMinuscula':
      return e.claveSinMinuscula
    case 'claveSinMayuscula':
      return e.claveSinMayuscula
    case 'claveSinNumero':
      return e.claveSinNumero
    case 'claveSinEspecial':
      return e.claveSinEspecial
    case 'politicaRequerida':
      return e.politicaRequerida
  }
}
