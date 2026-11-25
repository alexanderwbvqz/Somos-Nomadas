import { z } from 'zod'
import { LIMITES_CUENTA, type DatosInicioSesion, type DatosRegistro } from '../../domain/cuenta'

// Frontera con lo que llega del navegador: se comprueba la forma y se ponen topes generosos a cada texto
// (el control fino lo hace el dominio, que es el mismo que usa el formulario).
const texto = (maximo: number) => z.string().max(maximo)
const holgura = 4

const registroSchema = z.object({
  correo: texto(LIMITES_CUENTA.correo * holgura),
  clave: texto(LIMITES_CUENTA.claveMax * holgura),
  aceptaPolitica: z.boolean(),
  sitioSecundario: texto(500),
})

const inicioSesionSchema = z.object({
  correo: texto(LIMITES_CUENTA.correo * holgura),
  clave: texto(LIMITES_CUENTA.claveMax * holgura),
})

const correoSchema = texto(LIMITES_CUENTA.correo * holgura)

// El token del enlace del correo: un texto acotado. Su forma la revisa el dominio
const tokenSchema = z.string().max(500)

// La credencial de Google es un token largo; se acota para no aceptar textos desmesurados
const credencialSchema = z.string().min(1).max(4096)

export function leerDatosRegistro(entrada: unknown): DatosRegistro | undefined {
  const resultado = registroSchema.safeParse(entrada)
  return resultado.success ? resultado.data : undefined
}

export function leerDatosInicioSesion(entrada: unknown): DatosInicioSesion | undefined {
  const resultado = inicioSesionSchema.safeParse(entrada)
  return resultado.success ? resultado.data : undefined
}

export function leerCorreo(entrada: unknown): string | undefined {
  const resultado = correoSchema.safeParse(entrada)
  return resultado.success ? resultado.data : undefined
}

export function leerCredencial(entrada: unknown): string | undefined {
  const resultado = credencialSchema.safeParse(entrada)
  return resultado.success ? resultado.data : undefined
}

export function leerToken(entrada: unknown): string | undefined {
  const resultado = tokenSchema.safeParse(entrada)
  return resultado.success ? resultado.data : undefined
}
