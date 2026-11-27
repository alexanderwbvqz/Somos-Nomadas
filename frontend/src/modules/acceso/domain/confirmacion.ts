// El enlace para confirmar el correo (contrato/confirmacion-correo.md). El token llega en la dirección, tras «#».
// Dura 15 minutos y, abierto en el mismo navegador que lo pidió, además de confirmar abre la sesión.

import type { CredencialDeSesion } from './sesion'

/** Idiomas en los que el backend escribe el correo: los mismos de la web */
export const IDIOMAS_DEL_CORREO = ['es', 'en', 'pt'] as const
export type IdiomaDelCorreo = (typeof IDIOMAS_DEL_CORREO)[number]
export const IDIOMA_DEL_CORREO_POR_DEFECTO: IdiomaDelCorreo = 'es'

export function esIdiomaDelCorreo(valor: unknown): valor is IdiomaDelCorreo {
  return typeof valor === 'string' && (IDIOMAS_DEL_CORREO as readonly string[]).includes(valor)
}

// La misma forma que acepta el backend (base64 de URL, de 20 a 200 caracteres). Lo que no la tiene no se manda
const FORMA_DEL_TOKEN = /^[A-Za-z0-9_-]{20,200}$/

export function tieneFormaDeToken(token: string): boolean {
  return FORMA_DEL_TOKEN.test(token)
}

/** La marca del navegador tiene la misma forma que el token: aleatoria, en base64 de URL */
export function tieneFormaDeMarca(marca: string): boolean {
  return FORMA_DEL_TOKEN.test(marca)
}

/** Lo que devuelve el enlace al confirmar: el correo y, si se abrió en el navegador que lo pidió, la sesión abierta */
export type CorreoConfirmado = { correo: string; credencial?: CredencialDeSesion }

/**
 * La marca aleatoria que el servidor guarda en el navegador de quien pide un enlace (en la práctica, una cookie
 * `httpOnly`). Sirve para saber si el enlace se abre en ese mismo navegador. Es un secreto: no vuelve al navegador
 * en ningún resultado.
 */
export interface MarcaDelNavegador {
  /** Crea una marca nueva para este navegador (sustituye la anterior) y la devuelve */
  crear(): Promise<string>
  /** La marca de este navegador, o undefined si no tiene una válida */
  leer(): Promise<string | undefined>
  borrar(): Promise<void>
}
