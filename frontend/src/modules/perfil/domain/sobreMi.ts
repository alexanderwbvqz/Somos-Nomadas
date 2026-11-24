// «Sobre mí»: una presentación corta que la persona escribe en su perfil. Es opcional; vacío quiere decir que no escribió nada.
// La validación es una sola y la usan el formulario (para avisar) y el servidor (que no se fía del navegador).

export const LIMITE_SOBRE_MI = 600

export type CodigoErrorSobreMi = 'textoLargo'

export type ErroresSobreMi = { texto?: CodigoErrorSobreMi }

export function hayErroresSobreMi(errores: object): boolean {
  return Object.keys(errores).length > 0
}

/** Quita los espacios de los extremos y deja los saltos de línea como `\n` */
export function limpiarSobreMi(texto: string): string {
  return texto.replace(/\r\n?/g, '\n').trim()
}

export function validarSobreMi(texto: string): ErroresSobreMi {
  return limpiarSobreMi(texto).length > LIMITE_SOBRE_MI ? { texto: 'textoLargo' } : {}
}
