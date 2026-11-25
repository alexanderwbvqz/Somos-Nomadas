'use server'

import type { ResultadoGoogle } from '@/modules/acceso/application/continuarConGoogle'
import type { ResultadoInicioSesion } from '@/modules/acceso/application/iniciarSesion'
import type { ResultadoReenvio } from '@/modules/acceso/application/reenviarConfirmacion'
import type { ResultadoRegistro } from '@/modules/acceso/application/registrarCuenta'
import { recibirGoogle, recibirInicioSesion, recibirRegistro, recibirReenvio } from '@/modules/acceso/infrastructure/recepcion/recepcionAcceso'
import { identificarCliente } from '@/shared/lib/identificarCliente'
import { crearCuentaRepository } from '../fabricas/cuentas'

// Acciones de servidor que llaman los formularios de crear cuenta e iniciar sesión.
// Aquí solo se juntan las piezas: el adaptador (fábrica, que recibe la IP de quien envía para reenviarla al backend),
// quién envía y lo que hace el módulo con lo recibido.
export async function registrarCuentaAccion(entrada: unknown): Promise<ResultadoRegistro> {
  const cliente = await identificarCliente()
  return await recibirRegistro(crearCuentaRepository(cliente), entrada, cliente)
}

export async function iniciarSesionAccion(entrada: unknown): Promise<ResultadoInicioSesion> {
  const cliente = await identificarCliente()
  return await recibirInicioSesion(crearCuentaRepository(cliente), entrada, cliente)
}

export async function continuarConGoogleAccion(entrada: unknown): Promise<ResultadoGoogle> {
  const cliente = await identificarCliente()
  return await recibirGoogle(crearCuentaRepository(cliente), entrada, cliente)
}

export async function reenviarConfirmacionAccion(entrada: unknown): Promise<ResultadoReenvio> {
  const cliente = await identificarCliente()
  return await recibirReenvio(crearCuentaRepository(cliente), entrada, cliente)
}
