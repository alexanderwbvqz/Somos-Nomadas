import { headers } from 'next/headers'
import { origenDeCabeceras } from './origenDeCabeceras'

/** Quién envía una petición, para limitar los intentos repetidos: su dirección de red, o "desconocido" si no llega */
export async function identificarCliente(): Promise<string> {
  return origenDeCabeceras(await headers())
}
