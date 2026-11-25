import type { ClienteHttp, RespuestaApi } from '@/shared/api/clienteHttp'
import { ErrorDeApi } from '@/shared/api/errores'
import type { CuentaRepository } from '../../domain/CuentaRepository'
import type { CuentaNueva } from '../../domain/cuenta'
import {
  cuerpoDeInicioSesion,
  cuerpoDeRegistro,
  esCredencialesInvalidas,
  traducirErrorDeApi,
} from '../mappers/cuentaApiMapper'
import { leerSesionIniciada } from '../mappers/cuentaApiSchema'

/**
 * Las cuentas en la API del backend (contrato/autenticacion.md). Recibe el cliente ya configurado: no lee variables
 * de entorno ni sabe de dónde sale la IP de la persona; eso es de `composition/`.
 */
export class HttpCuentaRepository implements CuentaRepository {
  constructor(private readonly cliente: ClienteHttp) {}

  async registrar(cuenta: CuentaNueva): Promise<void> {
    try {
      await this.cliente.solicitar('POST', '/acceso/registro', { json: cuerpoDeRegistro(cuenta) })
    } catch (error) {
      throw error instanceof ErrorDeApi ? traducirErrorDeApi(error) : error
    }
  }

  async iniciarSesion(correo: string, clave: string): Promise<{ correo: string } | undefined> {
    let respuesta: RespuestaApi
    try {
      respuesta = await this.cliente.solicitar('POST', '/acceso/sesion', { json: cuerpoDeInicioSesion(correo, clave) })
    } catch (error) {
      if (esCredencialesInvalidas(error)) return undefined
      throw error instanceof ErrorDeApi ? traducirErrorDeApi(error) : error
    }
    const cuenta = leerSesionIniciada(respuesta.cuerpo)
    if (cuenta === undefined) throw new Error('La API respondió con una forma inesperada al iniciar sesión')
    return cuenta
  }

  async iniciarConGoogle(): Promise<{ correo: string } | undefined> {
    throw new Error('Entrar con Google todavía no está disponible en la API')
  }

  async reenviarConfirmacion(): Promise<void> {
    throw new Error('Reenviar la confirmación del correo todavía no está disponible en la API')
  }
}
