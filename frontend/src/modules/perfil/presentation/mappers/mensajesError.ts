import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { LIMITES_EVIDENCIA, type CodigoErrorEvidencia } from '../../domain/evidencia'
import { LIMITE_SOBRE_MI, type ErroresSobreMi } from '../../domain/sobreMi'
import { LIMITES_TRAYECTORIA, type ErroresEntradaTrayectoria } from '../../domain/trayectoria'
import type { TextosPerfil } from '../../language/tipos'

// Los mensajes, en el idioma de la persona, de los errores que dice el dominio. Un código sin mensaje no existe: cada uno tiene el suyo.

export function mensajeDeErrorSobreMi(textos: TextosPerfil['sobreMi'], errores: ErroresSobreMi): string | undefined {
  return errores.texto === 'textoLargo' ? rellenarPlantilla(textos.errorTextoLargo, { max: LIMITE_SOBRE_MI }) : undefined
}

const maximoPorCampo = { rol: LIMITES_TRAYECTORIA.rol, donde: LIMITES_TRAYECTORIA.donde, que: LIMITES_TRAYECTORIA.que } as const

/** El mensaje de cada campo de la entrada que falla; los que están bien no aparecen */
export function mensajesDeEntradaTrayectoria(
  textos: TextosPerfil['trayectoria'],
  errores: ErroresEntradaTrayectoria,
): Partial<Record<'desde' | 'hasta' | 'rol' | 'donde' | 'que', string>> {
  const mensajes: Partial<Record<'desde' | 'hasta' | 'rol' | 'donde' | 'que', string>> = {}
  if (errores.desde) mensajes.desde = textos.errores.desde
  if (errores.hasta) mensajes.hasta = textos.errores.hasta
  for (const campo of ['rol', 'donde', 'que'] as const) {
    const codigo = errores[campo]
    if (codigo === 'obligatorio' && campo !== 'que') mensajes[campo] = textos.errores[campo]
    else if (codigo === 'textoLargo') mensajes[campo] = rellenarPlantilla(textos.errores.textoLargo, { max: maximoPorCampo[campo] })
  }
  return mensajes
}

export function mensajeDeListaTrayectoria(textos: TextosPerfil['trayectoria']): string {
  return rellenarPlantilla(textos.errores.demasiadas, { max: LIMITES_TRAYECTORIA.entradas })
}

export function mensajeDeErrorEvidencia(textos: TextosPerfil['evidencia'], codigo: CodigoErrorEvidencia | 'demasiados'): string {
  switch (codigo) {
    case 'enlaceInvalido':
      return textos.errores.enlaceInvalido
    case 'enlaceLargo':
      return rellenarPlantilla(textos.errores.enlaceLargo, { max: LIMITES_EVIDENCIA.largo })
    case 'repetido':
      return textos.errores.repetido
    case 'demasiados':
      return rellenarPlantilla(textos.errores.demasiados, { max: LIMITES_EVIDENCIA.enlaces })
  }
}
