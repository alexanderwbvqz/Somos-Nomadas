import { headers } from 'next/headers'

/** Quién envía una petición, para limitar los intentos repetidos: su dirección de red, o "desconocido" si no llega */
export async function identificarCliente(): Promise<string> {
  const cabeceras = await headers()
  return cabeceras.get('x-forwarded-for')?.split(',')[0]?.trim() || cabeceras.get('x-real-ip') || 'desconocido'
}
