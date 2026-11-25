import type { CodigoErrorCuenta } from '../domain/cuenta'
import type { ErrorDeCamposInvalidos } from '../domain/errores'

/**
 * Los errores por campo que el servidor señaló y que el formulario puede mostrar: solo los de `formulario`.
 * El resto (el campo trampa, o campos que este formulario no tiene) no se muestra: no hay dónde ponerlo.
 */
export function camposRechazados<Campo extends string>(
  error: ErrorDeCamposInvalidos,
  formulario: readonly Campo[],
): Partial<Record<Campo, CodigoErrorCuenta>> {
  const errores: Partial<Record<Campo, CodigoErrorCuenta>> = {}
  for (const campo of formulario) {
    if (Object.hasOwn(error.campos, campo)) errores[campo] = error.campos[campo]
  }
  return errores
}
