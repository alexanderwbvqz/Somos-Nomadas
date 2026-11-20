import { iniciarSesion, type ResultadoInicioSesion } from '@/modules/acceso/application/iniciarSesion'
import { reenviarConfirmacion, type ResultadoReenvio } from '@/modules/acceso/application/reenviarConfirmacion'
import { registrarCuenta, type ResultadoRegistro } from '@/modules/acceso/application/registrarCuenta'
import { leerCorreo, leerDatosInicioSesion, leerDatosRegistro } from '@/modules/acceso/infrastructure/mappers/cuentaSchema'
import { crearLimitador } from '@/shared/lib/limitadorPeticiones'
import { crearCuentaRepository } from './fabricas/cuentas'

const DIEZ_MINUTOS = 10 * 60 * 1000

// Límites por cliente: crear cuentas es poco habitual; entrar admite más intentos (se equivoca la contraseña)
// pero no tantos como para adivinarla; reenviar el enlace, solo unas pocas veces.
const limiteRegistro = crearLimitador({ maximo: 5, ventanaMs: DIEZ_MINUTOS })
const limiteSesion = crearLimitador({ maximo: 10, ventanaMs: DIEZ_MINUTOS })
const limiteReenvio = crearLimitador({ maximo: 3, ventanaMs: DIEZ_MINUTOS })

/** `clienteId` identifica a quien envía (por ejemplo su dirección de red). */
export async function registrarEnServidor(entrada: unknown, clienteId: string): Promise<ResultadoRegistro> {
  if (!limiteRegistro.permitir(clienteId)) return { ok: false, errores: {}, motivo: 'limite' }
  const datos = leerDatosRegistro(entrada)
  if (!datos) return { ok: false, errores: {}, motivo: 'fallo' }
  return await registrarCuenta(crearCuentaRepository(), datos)
}

export async function iniciarSesionEnServidor(entrada: unknown, clienteId: string): Promise<ResultadoInicioSesion> {
  if (!limiteSesion.permitir(clienteId)) return { ok: false, errores: {}, motivo: 'limite' }
  const datos = leerDatosInicioSesion(entrada)
  if (!datos) return { ok: false, errores: {}, motivo: 'fallo' }
  return await iniciarSesion(crearCuentaRepository(), datos)
}

export async function reenviarEnServidor(entrada: unknown, clienteId: string): Promise<ResultadoReenvio> {
  const correo = leerCorreo(entrada)
  if (correo === undefined) return { ok: false, motivo: 'fallo' }
  if (!limiteReenvio.permitir(`${clienteId}|${correo.trim().toLowerCase()}`)) return { ok: false, motivo: 'limite' }
  return await reenviarConfirmacion(crearCuentaRepository(), correo)
}
