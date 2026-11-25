'use server'

import type { ResultadoConfirmacion } from '@/modules/acceso/application/confirmarCorreo'
import type { ResultadoGoogle } from '@/modules/acceso/application/continuarConGoogle'
import type { ResultadoInicioSesion } from '@/modules/acceso/application/iniciarSesion'
import type { ResultadoReenvio } from '@/modules/acceso/application/reenviarConfirmacion'
import type { ResultadoRegistro } from '@/modules/acceso/application/registrarCuenta'
import { cerrarSesion } from '@/modules/acceso/application/cerrarSesion'
import { CookieAlmacenDeSesion } from '@/modules/acceso/infrastructure/cookies/CookieAlmacenDeSesion'
import {
  recibirConfirmacion,
  recibirGoogle,
  recibirInicioSesion,
  recibirRegistro,
  recibirReenvio,
} from '@/modules/acceso/infrastructure/recepcion/recepcionAcceso'
import { identificarCliente } from '@/shared/lib/identificarCliente'
import { crearCuentaRepository } from '../fabricas/cuentas'

// Acciones de servidor que llaman los formularios de crear cuenta e iniciar sesión.
// Aquí solo se juntan las piezas: el adaptador (fábrica, que recibe la IP de quien envía para reenviarla al backend),
// dónde se guarda la sesión (cookies httpOnly) y lo que hace el módulo con lo recibido.
// `idioma` lo fija la pantalla en el servidor (`.bind`), no el navegador: es el del correo de confirmación
export async function registrarCuentaAccion(idioma: unknown, entrada: unknown): Promise<ResultadoRegistro> {
  const cliente = await identificarCliente()
  return await recibirRegistro(crearCuentaRepository(cliente), entrada, idioma)
}

export async function iniciarSesionAccion(entrada: unknown): Promise<ResultadoInicioSesion> {
  const cliente = await identificarCliente()
  return await recibirInicioSesion(crearCuentaRepository(cliente), new CookieAlmacenDeSesion(), entrada)
}

export async function continuarConGoogleAccion(entrada: unknown): Promise<ResultadoGoogle> {
  const cliente = await identificarCliente()
  return await recibirGoogle(crearCuentaRepository(cliente), entrada, cliente)
}

export async function reenviarConfirmacionAccion(idioma: unknown, entrada: unknown): Promise<ResultadoReenvio> {
  const cliente = await identificarCliente()
  return await recibirReenvio(crearCuentaRepository(cliente), entrada, idioma)
}

export async function confirmarCorreoAccion(entrada: unknown): Promise<ResultadoConfirmacion> {
  const cliente = await identificarCliente()
  return await recibirConfirmacion(crearCuentaRepository(cliente), entrada)
}

/** Cierra la sesión de quien la llama: avisa al backend y borra sus cookies. Nunca falla. */
export async function cerrarSesionAccion(): Promise<void> {
  const cliente = await identificarCliente()
  await cerrarSesion(crearCuentaRepository(cliente), new CookieAlmacenDeSesion())
}
