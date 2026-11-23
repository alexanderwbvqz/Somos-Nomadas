// Lo que una persona puede darnos para que sugiramos qué ha hecho: un PDF (su CV o su perfil de LinkedIn) y/o enlaces.
// La validación es una sola y la usan el formulario (para avisar) y el servidor (que no se fía del navegador).

export const LIMITES_MATERIAL = {
  /** Tamaño máximo del PDF */
  pdfBytes: 5 * 1024 * 1024,
  enlaceLargo: 300,
} as const

export const camposEnlace = ['web', 'github', 'otro'] as const
export type CampoEnlace = (typeof camposEnlace)[number]

/** Lo que se sabe del archivo; su contenido no entra en el dominio */
export type ArchivoPdf = { nombre: string; tamano: number; tipo: string }

export type DatosMaterial = {
  archivo?: ArchivoPdf
  web: string
  github: string
  otro: string
  /** Permiso para analizarlo con inteligencia artificial: sin él no se hace nada */
  aceptaAnalisis: boolean
}

export function datosMaterialVacios(): DatosMaterial {
  return { web: '', github: '', otro: '', aceptaAnalisis: false }
}

export type CodigoErrorMaterial =
  | 'sinMaterial'
  | 'archivoNoPdf'
  | 'archivoGrande'
  | 'enlaceInvalido'
  | 'enlaceLargo'
  | 'faltaPermiso'

export type ErroresMaterial = Partial<Record<'material' | 'archivo' | CampoEnlace | 'aceptaAnalisis', CodigoErrorMaterial>>

export function hayErroresMaterial(errores: object): boolean {
  return Object.keys(errores).length > 0
}

/** Si no trae esquema se entiende https; así "tuweb.com" vale igual que "https://tuweb.com" */
export function normalizarEnlace(texto: string): string {
  const limpio = texto.trim()
  if (limpio === '') return ''
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(limpio) ? limpio : `https://${limpio}`
}

const ES_IP = /^(\d{1,3}\.){3}\d{1,3}$|^\[.*\]$/

/** Solo direcciones de páginas públicas: nada de IP sueltas, de localhost ni de nombres internos */
export function esEnlaceValido(texto: string): boolean {
  let url: URL
  try {
    url = new URL(normalizarEnlace(texto))
  } catch {
    return false
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
  if (url.username !== '' || url.password !== '') return false
  const host = url.hostname.toLowerCase()
  if (!host.includes('.') || ES_IP.test(host)) return false
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) return false
  return true
}

/** Errores de un archivo suelto; se usa al elegirlo, antes de enviar nada */
export function errorDeArchivo(archivo: ArchivoPdf): CodigoErrorMaterial | undefined {
  const parecePdf = archivo.tipo === 'application/pdf' || (archivo.tipo === '' && archivo.nombre.toLowerCase().endsWith('.pdf'))
  if (!parecePdf || archivo.tamano <= 0) return 'archivoNoPdf'
  if (archivo.tamano > LIMITES_MATERIAL.pdfBytes) return 'archivoGrande'
  return undefined
}

export function enlacesDe(datos: DatosMaterial): { campo: CampoEnlace; texto: string }[] {
  return camposEnlace.map((campo) => ({ campo, texto: datos[campo] })).filter((enlace) => enlace.texto.trim() !== '')
}

export function hayMaterial(datos: DatosMaterial): boolean {
  return datos.archivo !== undefined || enlacesDe(datos).length > 0
}

export function validarMaterial(datos: DatosMaterial): ErroresMaterial {
  const errores: ErroresMaterial = {}

  if (datos.archivo) {
    const error = errorDeArchivo(datos.archivo)
    if (error) errores.archivo = error
  }

  for (const { campo, texto } of enlacesDe(datos)) {
    if (texto.trim().length > LIMITES_MATERIAL.enlaceLargo) errores[campo] = 'enlaceLargo'
    else if (!esEnlaceValido(texto)) errores[campo] = 'enlaceInvalido'
  }

  if (!hayMaterial(datos)) errores.material = 'sinMaterial'
  if (!datos.aceptaAnalisis) errores.aceptaAnalisis = 'faltaPermiso'
  return errores
}

/** Los enlaces ya revisados, completos y sin repetir */
export function limpiarEnlaces(datos: DatosMaterial): { campo: CampoEnlace; url: string }[] {
  const vistos = new Set<string>()
  const limpios: { campo: CampoEnlace; url: string }[] = []
  for (const { campo, texto } of enlacesDe(datos)) {
    const url = normalizarEnlace(texto)
    if (vistos.has(url)) continue
    vistos.add(url)
    limpios.push({ campo, url })
  }
  return limpios
}
