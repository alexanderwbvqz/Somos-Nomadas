'use server'

import type { ResultadoInicioSesion } from '@/modules/acceso/application/iniciarSesion'
import type { ResultadoReenvio } from '@/modules/acceso/application/reenviarConfirmacion'
import type { ResultadoRegistro } from '@/modules/acceso/application/registrarCuenta'
import { iniciarSesionEnServidor, registrarEnServidor, reenviarEnServidor } from './accesoServidor'
import { identificarCliente } from './identificarCliente'

// Acciones de servidor que llaman los formularios de crear cuenta e iniciar sesión.
export async function registrarCuentaAccion(entrada: unknown): Promise<ResultadoRegistro> {
  return await registrarEnServidor(entrada, await identificarCliente())
}

export async function iniciarSesionAccion(entrada: unknown): Promise<ResultadoInicioSesion> {
  return await iniciarSesionEnServidor(entrada, await identificarCliente())
}

export async function reenviarConfirmacionAccion(entrada: unknown): Promise<ResultadoReenvio> {
  return await reenviarEnServidor(entrada, await identificarCliente())
}
