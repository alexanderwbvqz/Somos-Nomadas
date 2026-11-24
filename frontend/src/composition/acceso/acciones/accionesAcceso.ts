'use server'

import type { ResultadoGoogle } from '@/modules/acceso/application/continuarConGoogle'
import type { ResultadoInicioSesion } from '@/modules/acceso/application/iniciarSesion'
import type { ResultadoReenvio } from '@/modules/acceso/application/reenviarConfirmacion'
import type { ResultadoRegistro } from '@/modules/acceso/application/registrarCuenta'
import { recibirGoogle, recibirInicioSesion, recibirRegistro, recibirReenvio } from '@/modules/acceso/infrastructure/recepcion/recepcionAcceso'
import { identificarCliente } from '@/shared/lib/identificarCliente'
import { crearCuentaRepository } from '../fabricas/cuentas'

// Acciones de servidor que llaman los formularios de crear cuenta e iniciar sesión.
// Aquí solo se juntan las piezas: el adaptador (fábrica), quién envía y lo que hace el módulo con lo recibido.
export async function registrarCuentaAccion(entrada: unknown): Promise<ResultadoRegistro> {
  return await recibirRegistro(crearCuentaRepository(), entrada, await identificarCliente())
}

export async function iniciarSesionAccion(entrada: unknown): Promise<ResultadoInicioSesion> {
  return await recibirInicioSesion(crearCuentaRepository(), entrada, await identificarCliente())
}

export async function continuarConGoogleAccion(entrada: unknown): Promise<ResultadoGoogle> {
  return await recibirGoogle(crearCuentaRepository(), entrada, await identificarCliente())
}

export async function reenviarConfirmacionAccion(entrada: unknown): Promise<ResultadoReenvio> {
  return await recibirReenvio(crearCuentaRepository(), entrada, await identificarCliente())
}
