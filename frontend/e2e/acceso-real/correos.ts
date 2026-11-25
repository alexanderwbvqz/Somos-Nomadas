import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

// Los correos que «envía» el backend de las pruebas: con el enviador de carpeta, cada correo es un archivo JSON en
// esta carpeta (la vacía playwright.acceso.config.ts al empezar). Fuera de Git.
export const CARPETA_DE_CORREOS = resolve('.e2e-correos')

export type Correo = { para: string; asunto: string; enlace: string; texto: string; html: string }

/** Los correos que recibió `destino`, del más viejo al más nuevo (los archivos se nombran por hora de envío) */
export function correosDe(destino: string): Correo[] {
  if (!existsSync(CARPETA_DE_CORREOS)) return []
  return readdirSync(CARPETA_DE_CORREOS)
    .filter((nombre) => nombre.endsWith('.json'))
    .sort()
    .map((nombre) => JSON.parse(readFileSync(join(CARPETA_DE_CORREOS, nombre), 'utf-8')) as Correo)
    .filter((correo) => correo.para === destino)
}

/**
 * Espera a que `destino` tenga más de `previos` correos y devuelve el último. El backend envía después de responder,
 * así que el correo llega un poco más tarde que la respuesta.
 */
export async function esperarCorreo(destino: string, previos = 0, esperaMs = 10_000): Promise<Correo> {
  const limite = Date.now() + esperaMs
  while (Date.now() < limite) {
    const recibidos = correosDe(destino)
    if (recibidos.length > previos) return recibidos[recibidos.length - 1] as Correo
    await new Promise((resolver) => setTimeout(resolver, 100))
  }
  throw new Error(`No llegó ningún correo nuevo a ${destino} en ${esperaMs} ms`)
}
