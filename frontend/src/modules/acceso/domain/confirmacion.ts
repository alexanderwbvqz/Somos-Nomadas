// El enlace para confirmar el correo (contrato/confirmacion-correo.md). El token llega en la dirección, tras «#».

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
