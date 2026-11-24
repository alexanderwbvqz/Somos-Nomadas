// «Evidencia»: enlaces a cosas que la persona hizo (una página, un repositorio, una campaña). Otras personas los verán y pulsarán,
// así que solo se aceptan enlaces `https` hacia un sitio con nombre. Este módulo nunca los visita.
// La validación es una sola y la usan el formulario (para avisar) y el servidor (que no se fía del navegador).

export const LIMITES_EVIDENCIA = { enlaces: 5, largo: 300 } as const

export type CodigoErrorEvidencia = 'enlaceInvalido' | 'enlaceLargo' | 'repetido'

/** Los errores de cada enlace, por su lugar en la lista, y el de la lista entera si hay demasiados */
export type ErroresEvidencia = { lista?: 'demasiados'; enlaces: Record<number, CodigoErrorEvidencia> }

export function hayErroresEvidencia(errores: ErroresEvidencia): boolean {
  return errores.lista !== undefined || Object.keys(errores.enlaces).length > 0
}

const PARECE_IP = /^\d{1,3}(\.\d{1,3}){3}$/

/**
 * El enlace ya normalizado si es seguro, o undefined. Seguro quiere decir: `https`, sin usuario ni clave (con ellos
 * `https://banco.com@otro.com` engaña), y un nombre de sitio con punto que no sea una dirección numérica.
 */
export function normalizarEnlace(texto: string): string | undefined {
  let url: URL
  try {
    url = new URL(texto.trim())
  } catch {
    return undefined
  }
  if (url.protocol !== 'https:') return undefined
  if (url.username !== '' || url.password !== '') return undefined
  if (!url.hostname.includes('.') || PARECE_IP.test(url.hostname) || url.hostname.startsWith('[')) return undefined
  return url.href
}

export function esEnlaceSeguro(texto: string): boolean {
  return normalizarEnlace(texto) !== undefined
}

export function validarEvidencia(enlaces: readonly string[]): ErroresEvidencia {
  const errores: ErroresEvidencia = { enlaces: {} }
  if (enlaces.length > LIMITES_EVIDENCIA.enlaces) errores.lista = 'demasiados'

  const vistos = new Set<string>()
  enlaces.forEach((enlace, lugar) => {
    if (enlace.trim().length > LIMITES_EVIDENCIA.largo) {
      errores.enlaces[lugar] = 'enlaceLargo'
      return
    }
    const normalizado = normalizarEnlace(enlace)
    if (normalizado === undefined) errores.enlaces[lugar] = 'enlaceInvalido'
    else if (vistos.has(normalizado)) errores.enlaces[lugar] = 'repetido'
    else vistos.add(normalizado)
  })
  return errores
}

/** Solo se llama con enlaces que ya pasaron `validarEvidencia`: los deja normalizados, en el mismo orden */
export function limpiarEvidencia(enlaces: readonly string[]): string[] {
  return enlaces.map((enlace) => normalizarEnlace(enlace) ?? '').filter((enlace) => enlace !== '')
}
