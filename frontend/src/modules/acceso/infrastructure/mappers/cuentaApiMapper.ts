import { ErrorDeApi } from '@/shared/api/errores'
import type { CodigoErrorCuenta, CuentaNueva } from '../../domain/cuenta'
import { ErrorDeCamposInvalidos, ErrorDeCorreoSinConfirmar, ErrorDeLimite } from '../../domain/errores'

// La traducción entre el dominio y la API de acceso: nombres de campo (camelCase ↔ snake_case), códigos de error y
// los errores del dominio. Los nombres de la API (contrato/autenticacion.md) solo viven aquí y en el esquema.

/** Lo que se manda a POST /acceso/registro */
export function cuerpoDeRegistro(cuenta: CuentaNueva) {
  return {
    correo: cuenta.correo,
    clave: cuenta.clave,
    acepta_politica: cuenta.aceptaPolitica,
    // El campo trampa: una persona no lo ve ni lo rellena. Siempre vacío
    sitio_secundario: '',
  }
}

/** Lo que se manda a POST /acceso/sesion */
export function cuerpoDeInicioSesion(correo: string, clave: string) {
  return { correo, clave }
}

const CAMPOS_DEL_DOMINIO: Readonly<Record<string, string>> = {
  correo: 'correo',
  clave: 'clave',
  acepta_politica: 'aceptaPolitica',
}

// Solo los códigos que el dominio tiene. Uno que no está aquí se descarta: no se le inventa un significado.
const CODIGOS_DEL_DOMINIO: Readonly<Record<string, CodigoErrorCuenta>> = {
  obligatorio: 'obligatorio',
  correo_invalido: 'correoInvalido',
  clave_corta: 'claveCorta',
  clave_larga: 'claveLarga',
  politica_requerida: 'politicaRequerida',
}

/** Los campos con error de una respuesta `datos_invalidos`, con los nombres y códigos del dominio */
export function camposDelDominio(campos: Readonly<Record<string, string>>): Record<string, CodigoErrorCuenta> {
  const resultado: Record<string, CodigoErrorCuenta> = {}
  for (const [campoApi, codigoApi] of Object.entries(campos)) {
    // hasOwn: un nombre como «constructor» o «toString» no debe encontrar nada en los diccionarios
    if (!Object.hasOwn(CAMPOS_DEL_DOMINIO, campoApi) || !Object.hasOwn(CODIGOS_DEL_DOMINIO, codigoApi)) continue
    const campo = CAMPOS_DEL_DOMINIO[campoApi]
    const codigo = CODIGOS_DEL_DOMINIO[codigoApi]
    if (campo !== undefined && codigo !== undefined) resultado[campo] = codigo
  }
  return resultado
}

/** Las credenciales no corresponden: no es un fallo, es la respuesta normal a una contraseña equivocada */
export function esCredencialesInvalidas(error: unknown): boolean {
  return error instanceof ErrorDeApi && error.codigo === 'credenciales_invalidas'
}

/**
 * El error del dominio que corresponde a un error de la API, si lo hay. Los demás se devuelven sin tocar: el caso de
 * uso los trata como un fallo.
 */
export function traducirErrorDeApi(error: ErrorDeApi): Error {
  if (error.codigo === 'limite_excedido' || error.estado === 429) return new ErrorDeLimite(error.reintentarEnSegundos)
  if (error.codigo === 'datos_invalidos') return new ErrorDeCamposInvalidos(camposDelDominio(error.campos))
  if (error.codigo === 'correo_sin_confirmar') return new ErrorDeCorreoSinConfirmar()
  return error
}
