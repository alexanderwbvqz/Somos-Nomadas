import { iniciarSesion, type ResultadoInicioSesion } from '../../application/iniciarSesion'
import { reenviarConfirmacion, type ResultadoReenvio } from '../../application/reenviarConfirmacion'
import { registrarCuenta, type ResultadoRegistro } from '../../application/registrarCuenta'
import type { CuentaRepository } from '../../domain/CuentaRepository'
import { crearLimitador } from '@/shared/lib/limitadorPeticiones'
import { leerCorreo, leerDatosInicioSesion, leerDatosRegistro } from '../mappers/cuentaSchema'

// Lo que hace el servidor al recibir algo de los formularios de acceso: limita los intentos repetidos de un mismo
// cliente, comprueba la forma de lo recibido y llama al caso de uso. El repositorio lo pone quien llama (composition),
// y `clienteId` identifica a quien envía (por ejemplo su dirección de red).

const DIEZ_MINUTOS = 10 * 60 * 1000

// Límites por cliente: crear cuentas es poco habitual; entrar admite más intentos (se equivoca la contraseña)
// pero no tantos como para adivinarla; reenviar el enlace, solo unas pocas veces.
// Los contadores viven aquí, fuera de las funciones, para que se acumulen entre una petición y otra.
const limiteRegistro = crearLimitador({ maximo: 5, ventanaMs: DIEZ_MINUTOS })
const limiteSesion = crearLimitador({ maximo: 10, ventanaMs: DIEZ_MINUTOS })
const limiteReenvio = crearLimitador({ maximo: 3, ventanaMs: DIEZ_MINUTOS })

export async function recibirRegistro(repositorio: CuentaRepository, entrada: unknown, clienteId: string): Promise<ResultadoRegistro> {
  if (!limiteRegistro.permitir(clienteId)) return { ok: false, errores: {}, motivo: 'limite' }
  const datos = leerDatosRegistro(entrada)
  if (!datos) return { ok: false, errores: {}, motivo: 'fallo' }
  return await registrarCuenta(repositorio, datos)
}

export async function recibirInicioSesion(repositorio: CuentaRepository, entrada: unknown, clienteId: string): Promise<ResultadoInicioSesion> {
  if (!limiteSesion.permitir(clienteId)) return { ok: false, errores: {}, motivo: 'limite' }
  const datos = leerDatosInicioSesion(entrada)
  if (!datos) return { ok: false, errores: {}, motivo: 'fallo' }
  return await iniciarSesion(repositorio, datos)
}

export async function recibirReenvio(repositorio: CuentaRepository, entrada: unknown, clienteId: string): Promise<ResultadoReenvio> {
  const correo = leerCorreo(entrada)
  if (correo === undefined) return { ok: false, motivo: 'fallo' }
  if (!limiteReenvio.permitir(`${clienteId}|${correo.trim().toLowerCase()}`)) return { ok: false, motivo: 'limite' }
  return await reenviarConfirmacion(repositorio, correo)
}
