import { cookies } from 'next/headers'
import type { AlmacenDeSesion, CredencialDeSesion, SesionGuardada } from '../../domain/sesion'
import { cookiesABorrar, cookiesDeCredencial, sesionDeCookies, type CookieAEscribir } from './cookiesDeSesion'

// La sesión de quien hace la petición, en sus cookies. Solo funciona dentro de una acción de servidor o una ruta de
// servidor (donde Next permite escribir cookies); el `proxy` usa las mismas funciones de `cookiesDeSesion` con las
// cookies de su propia petición.
const enProduccion = () => process.env.NODE_ENV === 'production'

export class CookieAlmacenDeSesion implements AlmacenDeSesion {
  async leer(): Promise<SesionGuardada> {
    const almacen = await cookies()
    return sesionDeCookies((nombre) => almacen.get(nombre)?.value, enProduccion())
  }

  async guardar(credencial: CredencialDeSesion): Promise<void> {
    await this.escribir(cookiesDeCredencial(credencial, enProduccion()))
  }

  async borrar(): Promise<void> {
    await this.escribir(cookiesABorrar(enProduccion()))
  }

  private async escribir(lista: CookieAEscribir[]): Promise<void> {
    const almacen = await cookies()
    for (const { nombre, valor, opciones } of lista) almacen.set(nombre, valor, opciones)
  }
}
