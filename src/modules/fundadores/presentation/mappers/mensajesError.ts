import type { CodigoErrorPerfil } from '../../domain/perfil'
import type { TextosFundadores } from '../../language/tipos'

type CampoObligatorio = 'nombre' | 'apellidos' | 'pais'

/** El mensaje, en el idioma de la persona, del error de un campo; undefined si no hay error */
export function mensajeDeErrorPerfil(
  textos: TextosFundadores['bienvenida'],
  campo: string,
  codigo: CodigoErrorPerfil | undefined,
): string | undefined {
  if (!codigo) return undefined
  const e = textos.errores
  switch (codigo) {
    case 'obligatorio':
      return e[campo as CampoObligatorio]
    case 'textoLargo':
      return e.textoLargo
    case 'busquedaVacia':
      return e.busquedaVacia
  }
}
