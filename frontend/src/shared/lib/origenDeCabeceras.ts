/** Quién envía una petición, para limitar los intentos repetidos: su dirección de red, o «desconocido» si no llega */
export function origenDeCabeceras(cabeceras: Pick<Headers, 'get'>): string {
  return cabeceras.get('x-forwarded-for')?.split(',')[0]?.trim() || cabeceras.get('x-real-ip') || 'desconocido'
}
