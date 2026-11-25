import { z } from 'zod'

// Lo que la API de acceso responde, con sus nombres (snake_case) tal cual. Se comprueba la forma: si el backend
// cambia el contrato, aquí falla con un error claro en vez de dejar pasar datos a medias.

const sesionIniciadaSchema = z.object({
  token_acceso: z.string().min(1),
  expira_en: z.number().int().positive(),
  token_renovacion: z.string().min(1),
  correo: z.string().min(1),
})

/**
 * El resultado de iniciar sesión: solo el correo. Los tokens se comprueban (la respuesta debe traerlos) pero no se
 * devuelven: llegarían al navegador si una acción de servidor devolviera este objeto, y los tokens no deben salir
 * del servidor. Guardarlos en cookies `httpOnly` es una pieza aparte.
 */
export function leerSesionIniciada(cuerpo: unknown): { correo: string } | undefined {
  const resultado = sesionIniciadaSchema.safeParse(cuerpo)
  return resultado.success ? { correo: resultado.data.correo } : undefined
}
