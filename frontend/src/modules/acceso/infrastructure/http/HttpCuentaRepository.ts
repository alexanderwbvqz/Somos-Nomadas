import type { ClienteHttp, RespuestaApi } from '@/shared/api/clienteHttp'
import { ErrorDeApi } from '@/shared/api/errores'
import type { CuentaRepository } from '../../domain/CuentaRepository'
import type { CorreoConfirmado, IdiomaDelCorreo } from '../../domain/confirmacion'
import type { CuentaNueva } from '../../domain/cuenta'
import type { CredencialDeSesion, CuentaActual } from '../../domain/sesion'
import {
  cuerpoDeConfirmacion,
  cuerpoDeInicioSesion,
  cuerpoDeRegistro,
  cuerpoDeReenvio,
  esEnlaceInvalido,
  esCredencialesInvalidas,
  esNoAutenticado,
  traducirErrorDeApi,
} from '../mappers/cuentaApiMapper'
import { leerCorreoConfirmado, leerCredencialRenovada, leerCuentaActual, leerSesionIniciada } from '../mappers/cuentaApiSchema'

/**
 * Las cuentas en la API del backend (contrato/autenticacion.md). Recibe el cliente ya configurado: no lee variables
 * de entorno ni sabe de dónde sale la IP de la persona; eso es de `composition/`.
 */
export class HttpCuentaRepository implements CuentaRepository {
  constructor(private readonly cliente: ClienteHttp) {}

  async registrar(cuenta: CuentaNueva, idioma: IdiomaDelCorreo, navegador?: string): Promise<void> {
    try {
      await this.cliente.solicitar('POST', '/acceso/registro', { json: cuerpoDeRegistro(cuenta, idioma, navegador) })
    } catch (error) {
      throw error instanceof ErrorDeApi ? traducirErrorDeApi(error) : error
    }
  }

  async iniciarSesion(correo: string, clave: string): Promise<{ correo: string; credencial: CredencialDeSesion } | undefined> {
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

  async renovarSesion(renovacion: string): Promise<CredencialDeSesion | undefined> {
    let respuesta: RespuestaApi
    try {
      respuesta = await this.cliente.solicitar('POST', '/acceso/renovar', { json: { token_renovacion: renovacion } })
    } catch (error) {
      // Solo un «no vale» de la API es un rechazo; una caída o un límite se dejan pasar para no tirar una sesión buena
      if (esNoAutenticado(error)) return undefined
      throw error
    }
    const credencial = leerCredencialRenovada(respuesta.cuerpo)
    if (credencial === undefined) throw new Error('La API respondió con una forma inesperada al renovar la sesión')
    return credencial
  }

  async cerrarSesion(renovacion: string): Promise<void> {
    await this.cliente.solicitar('POST', '/acceso/cierre', { json: { token_renovacion: renovacion } })
  }

  async obtenerCuenta(acceso: string): Promise<CuentaActual | undefined> {
    let respuesta: RespuestaApi
    try {
      respuesta = await this.cliente.solicitar('GET', '/acceso/yo', { token: acceso })
    } catch (error) {
      if (esNoAutenticado(error)) return undefined
      throw error
    }
    const cuenta = leerCuentaActual(respuesta.cuerpo)
    if (cuenta === undefined) throw new Error('La API respondió con una forma inesperada al preguntar quién es')
    return cuenta
  }

  async iniciarConGoogle(): Promise<{ correo: string } | undefined> {
    throw new Error('Entrar con Google todavía no está disponible en la API')
  }

  async reenviarConfirmacion(correo: string, idioma: IdiomaDelCorreo, navegador?: string): Promise<void> {
    try {
      await this.cliente.solicitar('POST', '/acceso/confirmacion/reenvio', { json: cuerpoDeReenvio(correo, idioma, navegador) })
    } catch (error) {
      throw error instanceof ErrorDeApi ? traducirErrorDeApi(error) : error
    }
  }

  async confirmarCorreo(token: string, navegador?: string): Promise<CorreoConfirmado | undefined> {
    let respuesta: RespuestaApi
    try {
      respuesta = await this.cliente.solicitar('POST', '/acceso/confirmacion', { json: cuerpoDeConfirmacion(token, navegador) })
    } catch (error) {
      if (esEnlaceInvalido(error)) return undefined
      throw error instanceof ErrorDeApi ? traducirErrorDeApi(error) : error
    }
    const confirmado = leerCorreoConfirmado(respuesta.cuerpo)
    if (confirmado === undefined) throw new Error('La API respondió con una forma inesperada al confirmar el correo')
    return confirmado
  }
}
