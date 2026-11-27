import { randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { tieneFormaDeMarca, type MarcaDelNavegador } from '../../domain/confirmacion'

// La marca del navegador que pide un enlace de confirmación (contrato/confirmacion-correo.md, sección 3 bis), en una
// cookie. Solo funciona dentro de una acción de servidor (donde Next permite escribir cookies).
//
// - `httpOnly`: el JavaScript de la página no la ve.
// - `SameSite=Lax`: no viaja en peticiones que otra web dispara con POST. La confirmación es una acción de servidor
//   de nuestra propia página, así que sí viaja.
// - `Secure` y prefijo `__Host-` en producción, como las de la sesión.
// - Dura lo mismo que el enlace: pasado ese tiempo ya no sirve para nada.

/** Lo mismo que dura el enlace en el backend */
export const SEGUNDOS_DE_LA_MARCA = 15 * 60

const enProduccion = () => process.env.NODE_ENV === 'production'
const nombre = () => (enProduccion() ? '__Host-nomadas_navegador' : 'nomadas_navegador')
const opciones = (maxAge: number) => ({ httpOnly: true, secure: enProduccion(), sameSite: 'lax' as const, path: '/', maxAge })

export class CookieMarcaNavegador implements MarcaDelNavegador {
  async crear(): Promise<string> {
    // 256 bits aleatorios: nadie puede adivinar la marca de otro navegador
    const valor = randomBytes(32).toString('base64url')
    ;(await cookies()).set(nombre(), valor, opciones(SEGUNDOS_DE_LA_MARCA))
    return valor
  }

  async leer(): Promise<string | undefined> {
    const valor = (await cookies()).get(nombre())?.value
    return valor !== undefined && tieneFormaDeMarca(valor) ? valor : undefined
  }

  async borrar(): Promise<void> {
    ;(await cookies()).set(nombre(), '', opciones(0))
  }
}
