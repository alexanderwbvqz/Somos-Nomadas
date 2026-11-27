import { confirmarCorreo, type ResultadoConfirmacion } from '../../application/confirmarCorreo'
import { continuarConGoogle, type ResultadoGoogle } from '../../application/continuarConGoogle'
import { iniciarSesion, type ResultadoInicioSesion } from '../../application/iniciarSesion'
import { reenviarConfirmacion, type ResultadoReenvio } from '../../application/reenviarConfirmacion'
import { registrarCuenta, type ResultadoRegistro } from '../../application/registrarCuenta'
import type { CuentaRepository } from '../../domain/CuentaRepository'
import { esIdiomaDelCorreo, IDIOMA_DEL_CORREO_POR_DEFECTO, type IdiomaDelCorreo, type MarcaDelNavegador } from '../../domain/confirmacion'
import type { AlmacenDeSesion } from '../../domain/sesion'
import { crearLimitador } from '@/shared/lib/limitadorPeticiones'
import { leerCorreo, leerCredencial, leerDatosInicioSesion, leerDatosRegistro, leerToken } from '../mappers/cuentaSchema'

// Lo que hace el servidor al recibir algo de los formularios de acceso: comprueba la forma de lo recibido y llama al
// caso de uso. El repositorio, el almacén de la sesión y la marca del navegador los pone quien llama (composition).
// Los límites de intentos de registro, inicio de sesión, confirmación y reenvío los cuenta el backend, en la base de
// datos y por persona (el servidor de Next los reenvía con la IP de cada una); aquí no se repiten, porque unos
// contadores en la memoria de cada servidor no suman entre sí. Google todavía no existe en el backend: se limita aquí.

const DIEZ_MINUTOS = 10 * 60 * 1000

// Los contadores viven aquí, fuera de las funciones, para que se acumulen entre una petición y otra.
const limiteGoogle = crearLimitador({ maximo: 10, ventanaMs: DIEZ_MINUTOS })

/** El idioma de la página en la que se pidió: el del correo. Lo que no sea un idioma de la web, español */
function idiomaDelCorreo(idioma: unknown): IdiomaDelCorreo {
  return esIdiomaDelCorreo(idioma) ? idioma : IDIOMA_DEL_CORREO_POR_DEFECTO
}

export async function recibirRegistro(
  repositorio: CuentaRepository,
  entrada: unknown,
  idioma: unknown,
  marca?: MarcaDelNavegador,
): Promise<ResultadoRegistro> {
  const datos = leerDatosRegistro(entrada)
  if (!datos) return { ok: false, errores: {}, motivo: 'fallo' }
  return await registrarCuenta(repositorio, datos, idiomaDelCorreo(idioma), marca)
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

export async function recibirReenvio(
  repositorio: CuentaRepository,
  entrada: unknown,
  idioma: unknown,
  marca?: MarcaDelNavegador,
): Promise<ResultadoReenvio> {
  const correo = leerCorreo(entrada)
  if (correo === undefined) return { ok: false, motivo: 'fallo' }
  return await reenviarConfirmacion(repositorio, correo, idiomaDelCorreo(idioma), marca)
}

export async function recibirConfirmacion(
  repositorio: CuentaRepository,
  entrada: unknown,
  marca?: MarcaDelNavegador,
  almacen?: AlmacenDeSesion,
): Promise<ResultadoConfirmacion> {
  const token = leerToken(entrada)
  if (token === undefined) return { ok: false, motivo: 'invalido' }
  return await confirmarCorreo(repositorio, token, { marca, almacen })
}
