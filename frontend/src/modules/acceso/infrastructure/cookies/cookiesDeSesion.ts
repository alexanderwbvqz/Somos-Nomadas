import type { CredencialDeSesion, SesionGuardada } from '../../domain/sesion'

// Cómo se guarda la sesión en cookies. Son funciones puras (sin Next): las usan el almacén de las acciones de servidor
// y el `proxy`, que leen y escriben las cookies con APIs distintas.
//
// - `httpOnly`: el JavaScript de la página no las ve, así que una página comprometida no puede robarlas.
// - `SameSite=Lax`: no viajan en peticiones que otra web dispara con POST.
// - `Secure` y prefijo `__Host-` en producción: solo por https, solo de este dominio (sin `Domain`) y de toda la web.

export type OpcionesDeCookie = { httpOnly: true; secure: boolean; sameSite: 'lax'; path: '/'; maxAge: number }
export type CookieAEscribir = { nombre: string; valor: string; opciones: OpcionesDeCookie }

const TREINTA_DIAS = 30 * 24 * 60 * 60
// El acceso desaparece un poco antes de caducar de verdad: así se renueva antes de que el backend lo rechace
const MARGEN_DEL_ACCESO = 30
// Lo que puede ser un token (JWT o aleatorio en base64 de URL) y no más: lo que llega de una cookie se manda luego
// en una cabecera, así que nada de espacios, saltos de línea ni comillas
const VALOR_VALIDO = /^[A-Za-z0-9._~+/=-]{1,2048}$/

export function nombresDeCookies(produccion: boolean): { acceso: string; renovacion: string } {
  const prefijo = produccion ? '__Host-' : ''
  return { acceso: `${prefijo}nomadas_acceso`, renovacion: `${prefijo}nomadas_renovacion` }
}

function opciones(produccion: boolean, maxAge: number): OpcionesDeCookie {
  return { httpOnly: true, secure: produccion, sameSite: 'lax', path: '/', maxAge }
}

export function cookiesDeCredencial(credencial: CredencialDeSesion, produccion: boolean): CookieAEscribir[] {
  const nombres = nombresDeCookies(produccion)
  return [
    {
      nombre: nombres.acceso,
      valor: credencial.acceso,
      opciones: opciones(produccion, Math.max(credencial.expiraEnSegundos - MARGEN_DEL_ACCESO, 1)),
    },
    { nombre: nombres.renovacion, valor: credencial.renovacion, opciones: opciones(produccion, TREINTA_DIAS) },
  ]
}

export function cookiesABorrar(produccion: boolean): CookieAEscribir[] {
  const nombres = nombresDeCookies(produccion)
  return [nombres.acceso, nombres.renovacion].map((nombre) => ({ nombre, valor: '', opciones: opciones(produccion, 0) }))
}

export function sesionDeCookies(leer: (nombre: string) => string | undefined, produccion: boolean): SesionGuardada {
  const nombres = nombresDeCookies(produccion)
  const valido = (valor: string | undefined) => (valor !== undefined && VALOR_VALIDO.test(valor) ? valor : undefined)
  return { acceso: valido(leer(nombres.acceso)), renovacion: valido(leer(nombres.renovacion)) }
}
