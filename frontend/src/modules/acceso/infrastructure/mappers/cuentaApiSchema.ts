import { z } from 'zod'
import type { CredencialDeSesion, CuentaActual } from '../../domain/sesion'

// Lo que la API de acceso responde, con sus nombres (snake_case) tal cual. Se comprueba la forma: si el backend
// cambia el contrato, aquí falla con un error claro en vez de dejar pasar datos a medias. Cada lector devuelve solo
// lo que el dominio necesita y con los nombres del dominio: lo que la API añada de más no pasa.

const credencialSchema = z.object({
  token_acceso: z.string().min(1),
  expira_en: z.number().int().positive(),
  token_renovacion: z.string().min(1),
})

const sesionIniciadaSchema = credencialSchema.extend({ correo: z.string().min(1) })

const cuentaActualSchema = z.object({
  id: z.string().min(1),
  correo: z.string().min(1),
  correo_confirmado: z.boolean(),
})

type DatosDeCredencial = z.infer<typeof credencialSchema>

function credencialDe(datos: DatosDeCredencial): CredencialDeSesion {
  return { acceso: datos.token_acceso, renovacion: datos.token_renovacion, expiraEnSegundos: datos.expira_en }
}

/** La sesión que abre `POST /acceso/sesion`: el correo y la credencial (que solo debe usar el servidor) */
export function leerSesionIniciada(cuerpo: unknown): { correo: string; credencial: CredencialDeSesion } | undefined {
  const resultado = sesionIniciadaSchema.safeParse(cuerpo)
  return resultado.success ? { correo: resultado.data.correo, credencial: credencialDe(resultado.data) } : undefined
}

/** El par nuevo que entrega `POST /acceso/renovar` */
export function leerCredencialRenovada(cuerpo: unknown): CredencialDeSesion | undefined {
  const resultado = credencialSchema.safeParse(cuerpo)
  return resultado.success ? credencialDe(resultado.data) : undefined
}

/** Quién es la persona, según `GET /acceso/yo` */
export function leerCuentaActual(cuerpo: unknown): CuentaActual | undefined {
  const resultado = cuentaActualSchema.safeParse(cuerpo)
  if (!resultado.success) return undefined
  const { id, correo, correo_confirmado } = resultado.data
  return { id, correo, correoConfirmado: correo_confirmado }
}

const correoConfirmadoSchema = z.object({ correo: z.string().min(1) })

/** El correo que devuelve `POST /acceso/confirmacion` al confirmarlo */
export function leerCorreoConfirmado(cuerpo: unknown): string | undefined {
  const resultado = correoConfirmadoSchema.safeParse(cuerpo)
  return resultado.success ? resultado.data.correo : undefined
}
