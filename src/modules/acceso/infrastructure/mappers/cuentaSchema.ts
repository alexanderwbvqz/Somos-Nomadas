import { z } from 'zod'
import { LIMITES_CUENTA, PAISES, type DatosInicioSesion, type DatosRegistro } from '../../domain/cuenta'

// Frontera con lo que llega del navegador: se comprueba la forma y se ponen topes generosos a cada texto
// (el control fino lo hace el dominio, que es el mismo que usa el formulario).
const texto = (maximo: number) => z.string().max(maximo)
const holgura = 4

const registroSchema = z.object({
  nombre: texto(LIMITES_CUENTA.nombre * holgura),
  apellidos: texto(LIMITES_CUENTA.apellidos * holgura),
  pais: z.union([z.enum(PAISES), z.literal('')]),
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
