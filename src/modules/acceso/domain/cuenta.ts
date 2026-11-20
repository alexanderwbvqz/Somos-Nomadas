import { esCorreoValido } from '@/modules/aliados/domain/postulacion'

// Reglas de la cuenta: crear una (registro) y entrar con ella (inicio de sesión).
// La validación es una sola y la usan el formulario (para avisar) y el servidor (que no se fía del navegador).

export const LIMITES_CUENTA = {
  nombre: 60,
  apellidos: 80,
  correo: 120,
  claveMin: 8,
  claveMax: 128,
} as const

/** Países entre los que se puede elegir al registrarse; el nombre de cada uno va en los textos */
export const PAISES = ['AR', 'BO', 'BR', 'CL', 'CO', 'EC', 'MX', 'PY', 'PE', 'UY', 'OTRO'] as const
export type CodigoPais = (typeof PAISES)[number]

export type DatosRegistro = {
  nombre: string
  apellidos: string
  pais: CodigoPais | ''
  /** Privado: solo para el acceso y para escribirle */
  correo: string
  clave: string
  aceptaPolitica: boolean
  /** Campo trampa: una persona no lo ve ni lo rellena; si trae algo, es un robot */
  sitioSecundario: string
}

export function datosRegistroVacios(): DatosRegistro {
  return { nombre: '', apellidos: '', pais: '', correo: '', clave: '', aceptaPolitica: false, sitioSecundario: '' }
}

export type DatosInicioSesion = { correo: string; clave: string }

export type CodigoErrorCuenta =
  | 'obligatorio'
  | 'muyLargo'
  | 'correoInvalido'
  | 'claveCorta'
  | 'claveLarga'
  | 'politicaRequerida'

export type ErroresRegistro = Partial<Record<keyof DatosRegistro, CodigoErrorCuenta>>
export type ErroresInicioSesion = Partial<Record<keyof DatosInicioSesion, CodigoErrorCuenta>>

export function hayErroresCuenta(errores: object): boolean {
  return Object.keys(errores).length > 0
}

function errorDeCorreo(correo: string): CodigoErrorCuenta | undefined {
  const limpio = correo.trim()
  if (limpio === '') return 'obligatorio'
  return limpio.length > LIMITES_CUENTA.correo || !esCorreoValido(limpio) ? 'correoInvalido' : undefined
}

export function validarRegistro(datos: DatosRegistro): ErroresRegistro {
  const errores: ErroresRegistro = {}

  if (datos.nombre.trim() === '') errores.nombre = 'obligatorio'
  else if (datos.nombre.trim().length > LIMITES_CUENTA.nombre) errores.nombre = 'muyLargo'

  if (datos.apellidos.trim() === '') errores.apellidos = 'obligatorio'
  else if (datos.apellidos.trim().length > LIMITES_CUENTA.apellidos) errores.apellidos = 'muyLargo'

  if (!(PAISES as readonly string[]).includes(datos.pais)) errores.pais = 'obligatorio'

  const correo = errorDeCorreo(datos.correo)
  if (correo) errores.correo = correo

  // La contraseña no se recorta: los espacios cuentan
  if (datos.clave.length < LIMITES_CUENTA.claveMin) errores.clave = 'claveCorta'
  else if (datos.clave.length > LIMITES_CUENTA.claveMax) errores.clave = 'claveLarga'

  if (!datos.aceptaPolitica) errores.aceptaPolitica = 'politicaRequerida'
  return errores
}

export function validarInicioSesion(datos: DatosInicioSesion): ErroresInicioSesion {
  const errores: ErroresInicioSesion = {}
  const correo = errorDeCorreo(datos.correo)
  if (correo) errores.correo = correo
  if (datos.clave === '') errores.clave = 'obligatorio'
  else if (datos.clave.length > LIMITES_CUENTA.claveMax) errores.clave = 'claveLarga'
  return errores
}

/** Un campo trampa relleno delata a un robot */
export function esRobotRegistro(datos: DatosRegistro): boolean {
  return datos.sitioSecundario.trim() !== ''
}

export type FuerzaClave = 0 | 1 | 2 | 3

/** 0: todavía no llega al mínimo · 1: aceptable · 2: mezcla letras y números · 3: además es larga */
export function fuerzaDeClave(clave: string): FuerzaClave {
  if (clave.length < LIMITES_CUENTA.claveMin) return 0
  const mezcla = /[A-Za-z]/.test(clave) && /\d/.test(clave)
  return (1 + (mezcla ? 1 : 0) + (clave.length >= 12 ? 1 : 0)) as FuerzaClave
}

/** Los datos de una cuenta ya revisados y ordenados, listos para crearla */
export type CuentaNueva = {
  nombre: string
  apellidos: string
  pais: CodigoPais
  correo: string
  clave: string
}

export function limpiarRegistro(datos: DatosRegistro): CuentaNueva {
  return {
    nombre: datos.nombre.trim().replace(/\s+/g, ' '),
    apellidos: datos.apellidos.trim().replace(/\s+/g, ' '),
    pais: datos.pais as CodigoPais,
    correo: datos.correo.trim().toLowerCase(),
    clave: datos.clave,
  }
}
