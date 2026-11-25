import { continuarConGoogle, type ResultadoGoogle } from '../../application/continuarConGoogle'
import { iniciarSesion, type ResultadoInicioSesion } from '../../application/iniciarSesion'
import { reenviarConfirmacion, type ResultadoReenvio } from '../../application/reenviarConfirmacion'
import { registrarCuenta, type ResultadoRegistro } from '../../application/registrarCuenta'
import type { CuentaRepository } from '../../domain/CuentaRepository'
import type { AlmacenDeSesion } from '../../domain/sesion'
import { crearLimitador } from '@/shared/lib/limitadorPeticiones'
import { leerCorreo, leerCredencial, leerDatosInicioSesion, leerDatosRegistro } from '../mappers/cuentaSchema'

// Lo que hace el servidor al recibir algo de los formularios de acceso: comprueba la forma de lo recibido y llama al
// caso de uso. El repositorio y el almacén de la sesión los pone quien llama (composition).
// Los límites de intentos de registro e inicio de sesión los cuenta el backend, en la base de datos y por persona
// (el servidor de Next los reenvía con la IP de cada una); aquí no se repiten, porque unos contadores en la memoria
// de cada servidor no suman entre sí. Google y el reenvío todavía no existen en el backend: siguen limitados aquí.

const DIEZ_MINUTOS = 10 * 60 * 1000

// Los contadores viven aquí, fuera de las funciones, para que se acumulen entre una petición y otra.
const limiteGoogle = crearLimitador({ maximo: 10, ventanaMs: DIEZ_MINUTOS })
const limiteReenvio = crearLimitador({ maximo: 3, ventanaMs: DIEZ_MINUTOS })

export async function recibirRegistro(repositorio: CuentaRepository, entrada: unknown): Promise<ResultadoRegistro> {
  const datos = leerDatosRegistro(entrada)
  if (!datos) return { ok: false, errores: {}, motivo: 'fallo' }
  return await registrarCuenta(repositorio, datos)
}

export async function recibirInicioSesion(repositorio: CuentaRepository, almacen: AlmacenDeSesion, entrada: unknown): Promise<ResultadoInicioSesion> {
  const datos = leerDatosInicioSesion(entrada)
  if (!datos) return { ok: false, errores: {}, motivo: 'fallo' }
  return await iniciarSesion(repositorio, almacen, datos)
}

export async function recibirGoogle(repositorio: CuentaRepository, entrada: unknown, clienteId: string): Promise<ResultadoGoogle> {
  if (!limiteGoogle.permitir(clienteId)) return { ok: false, motivo: 'limite' }
  const credencial = leerCredencial(entrada)
  if (credencial === undefined) return { ok: false, motivo: 'rechazada' }
  return await continuarConGoogle(repositorio, credencial)
}

export async function recibirReenvio(repositorio: CuentaRepository, entrada: unknown, clienteId: string): Promise<ResultadoReenvio> {
  const correo = leerCorreo(entrada)
  if (correo === undefined) return { ok: false, motivo: 'fallo' }
  if (!limiteReenvio.permitir(`${clienteId}|${correo.trim().toLowerCase()}`)) return { ok: false, motivo: 'limite' }
  return await reenviarConfirmacion(repositorio, correo)
}
