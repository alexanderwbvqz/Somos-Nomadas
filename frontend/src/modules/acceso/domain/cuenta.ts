// Reglas de la cuenta: crear una (registro) y entrar con ella (inicio de sesión). Una cuenta es solo identidad:
// quién entra. El nombre, el país y lo demás son del perfil y se piden dentro, no aquí.
// La validación es una sola y la usan el formulario (para avisar) y el servidor (que no se fía del navegador).

export const LIMITES_CUENTA = {
  correo: 120,
  parteLocal: 64,
  claveMin: 8,
  claveMax: 128,
} as const

export type DatosRegistro = {
  /** Privado: solo para el acceso y para escribirle */
  correo: string
  clave: string
  aceptaPolitica: boolean
  /** Campo trampa: una persona no lo ve ni lo rellena; si trae algo, es un robot */
  sitioSecundario: string
}

export function datosRegistroVacios(): DatosRegistro {
  return { correo: '', clave: '', aceptaPolitica: false, sitioSecundario: '' }
}

export type DatosInicioSesion = { correo: string; clave: string }

export type CodigoErrorCuenta =
  | 'obligatorio'
  | 'correoInvalido'
  | 'claveCorta'
  | 'claveLarga'
  | 'claveSinMinuscula'
  | 'claveSinMayuscula'
  | 'claveSinNumero'
  | 'claveSinEspecial'
  | 'politicaRequerida'

export type ErroresRegistro = Partial<Record<keyof DatosRegistro, CodigoErrorCuenta>>
export type ErroresInicioSesion = Partial<Record<keyof DatosInicioSesion, CodigoErrorCuenta>>

export function hayErroresCuenta(errores: object): boolean {
  return Object.keys(errores).length > 0
}

// Estas reglas replican las del backend (backend/src/modules/acceso/domain/cuenta.py) carácter por carácter:
// cuentan caracteres de verdad (un emoji es 1, no 2) y usan los mismos espacios y categorías de Unicode.
// contrato/reglas-de-cuenta.json guarda casos con la respuesta del backend y un test comprueba que aquí da lo mismo.

// Los espacios que Python recorta con str.strip() (no son los mismos que recorta trim() de JavaScript)
const ESPACIOS = String.raw`\t-\r\x1c-\x20\x85\xa0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000`
const EXTREMOS = new RegExp(String.raw`^[${ESPACIOS}]+|[${ESPACIOS}]+$`, 'gu')
const ESPACIO_O_CONTROL = new RegExp(String.raw`[${ESPACIOS}\p{Cc}]`, 'u')

const largo = (texto: string): number => Array.from(texto).length

export function normalizarCorreo(correo: string): string {
  return correo.replace(EXTREMOS, '').toLowerCase()
}

function esCorreoBienFormado(correo: string): boolean {
  if (largo(correo) > LIMITES_CUENTA.correo || ESPACIO_O_CONTROL.test(correo)) return false
  const partes = correo.split('@')
  if (partes.length !== 2) return false
  const [local, dominio] = partes as [string, string]
  if (local === '' || largo(local) > LIMITES_CUENTA.parteLocal) return false
  if (!dominio.includes('.') || dominio.startsWith('.') || dominio.endsWith('.') || dominio.includes('..')) return false
  const terminacion = dominio.slice(dominio.lastIndexOf('.') + 1)
  return largo(terminacion) >= 2 && /^\p{L}+$/u.test(terminacion)
}

/** Lo normaliza y comprueba que sea un correo bien formado (para quien solo necesita saber sí o no) */
export function correoEsValido(correo: string): boolean {
  return errorDeCorreo(correo) === undefined
}

function errorDeCorreo(correo: string): CodigoErrorCuenta | undefined {
  // Se valida ya normalizado: es lo que se guarda, y pasar a minúsculas puede alargar el texto («İ» ocupa 2)
  const limpio = normalizarCorreo(correo)
  if (limpio === '') return 'obligatorio'
  return esCorreoBienFormado(limpio) ? undefined : 'correoInvalido'
}

const MINUSCULA = /\p{Lowercase}/u
const MAYUSCULA = /\p{Uppercase}/u
const NUMERO = /\p{Nd}/u
const NO_ES_LETRA_NI_NUMERO = /[^\p{L}\p{N}]/u

/** La primera regla de composición que incumple la clave, en este orden: minúscula, mayúscula, número, especial */
function errorDeComposicion(clave: string): CodigoErrorCuenta | undefined {
  if (!MINUSCULA.test(clave)) return 'claveSinMinuscula'
  if (!MAYUSCULA.test(clave)) return 'claveSinMayuscula'
  if (!NUMERO.test(clave)) return 'claveSinNumero'
  // Especial es todo lo que no es letra ni número: la ñ y las tildes son letras; el espacio es especial
  if (!NO_ES_LETRA_NI_NUMERO.test(clave)) return 'claveSinEspecial'
  return undefined
}

function errorDeClaveNueva(clave: string): CodigoErrorCuenta | undefined {
  // La contraseña no se recorta: los espacios cuentan
  const caracteres = largo(clave)
  if (caracteres < LIMITES_CUENTA.claveMin) return 'claveCorta'
  if (caracteres > LIMITES_CUENTA.claveMax) return 'claveLarga'
  return errorDeComposicion(clave)
}

export function validarRegistro(datos: DatosRegistro): ErroresRegistro {
  const errores: ErroresRegistro = {}

  const correo = errorDeCorreo(datos.correo)
  if (correo) errores.correo = correo

  const clave = errorDeClaveNueva(datos.clave)
  if (clave) errores.clave = clave

  if (!datos.aceptaPolitica) errores.aceptaPolitica = 'politicaRequerida'
  return errores
}

export function validarInicioSesion(datos: DatosInicioSesion): ErroresInicioSesion {
  const errores: ErroresInicioSesion = {}
  const correo = errorDeCorreo(datos.correo)
  if (correo) errores.correo = correo
  if (datos.clave === '') errores.clave = 'obligatorio'
  else if (largo(datos.clave) > LIMITES_CUENTA.claveMax) errores.clave = 'claveLarga'
  return errores
}

/** Un campo trampa relleno delata a un robot */
export function esRobotRegistro(datos: DatosRegistro): boolean {
  return datos.sitioSecundario.trim() !== ''
}

export type FuerzaClave = 0 | 1 | 2 | 3

/** 0: todavía incumple alguna regla · 1: cumple todas (aceptable) · 2: además de 12 o más caracteres · 3: de 16 o más */
export function fuerzaDeClave(clave: string): FuerzaClave {
  if (errorDeClaveNueva(clave) !== undefined) return 0
  const caracteres = largo(clave)
  return caracteres >= 16 ? 3 : caracteres >= 12 ? 2 : 1
}

/** Los datos de una cuenta ya revisados y ordenados, listos para crearla */
export type CuentaNueva = {
  correo: string
  clave: string
  /** Siempre true: el registro ya exigió que se aceptara. Se guarda como prueba del consentimiento */
  aceptaPolitica: true
}

export function limpiarRegistro(datos: DatosRegistro): CuentaNueva {
  return { correo: normalizarCorreo(datos.correo), clave: datos.clave, aceptaPolitica: true }
}
