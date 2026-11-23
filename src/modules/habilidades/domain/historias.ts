// «Tus historias»: lo que la persona cuenta con sus palabras y los sectores que le mueven. Todo es opcional, pero si escribe
// algo hace falta su permiso para mostrarlo en su perfil, donde lo leerán otros nómadas.
// La validación es una sola y la usan el formulario (para avisar) y el servidor (que no se fía del navegador).

export const sectores = [
  'salud',
  'educacion',
  'agro',
  'energiaClima',
  'turismo',
  'comercio',
  'fintech',
  'impactoSocial',
  'gastronomia',
  'moda',
  'videojuegos',
  'logistica',
  'construccion',
  'industria',
  'medios',
] as const
export type SectorId = (typeof sectores)[number]

export const LIMITES_HISTORIAS = {
  /** Largo máximo de cada texto */
  texto: 1200,
  sectoresMax: 5,
} as const

export type DatosHistorias = {
  /** Algo que logró o construyó */
  logro: string
  /** Un problema difícil que resolvió con otras personas */
  problemaDificil: string
  /** Qué problema del mundo le gustaría resolver */
  problemaMundo: string
  sectores: SectorId[]
  /** Permiso para mostrar lo escrito en su perfil, donde lo leerán otros nómadas */
  aceptaMostrar: boolean
}

/** Lo mismo, tal como llega del navegador: los sectores todavía no se sabe si son válidos */
export type EntradaHistorias = Omit<DatosHistorias, 'sectores'> & { sectores: readonly string[] }

export function datosHistoriasVacios(): DatosHistorias {
  return { logro: '', problemaDificil: '', problemaMundo: '', sectores: [], aceptaMostrar: false }
}

export type CodigoErrorHistorias = 'textoLargo' | 'sectorInvalido' | 'demasiadosSectores' | 'faltaPermiso'

export type ErroresHistorias = Partial<Record<'logro' | 'problemaDificil' | 'problemaMundo' | 'sectores' | 'aceptaMostrar', CodigoErrorHistorias>>

export function hayErroresHistorias(errores: object): boolean {
  return Object.keys(errores).length > 0
}

const camposDeTexto = ['logro', 'problemaDificil', 'problemaMundo'] as const

/** Si escribió algo en alguno de los tres textos */
export function hayTexto(datos: Pick<DatosHistorias, 'logro' | 'problemaDificil' | 'problemaMundo'>): boolean {
  return camposDeTexto.some((campo) => datos[campo].trim() !== '')
}

export function esSector(valor: unknown): valor is SectorId {
  return typeof valor === 'string' && (sectores as readonly string[]).includes(valor)
}

export function validarHistorias(datos: EntradaHistorias): ErroresHistorias {
  const errores: ErroresHistorias = {}

  for (const campo of camposDeTexto) {
    if (datos[campo].trim().length > LIMITES_HISTORIAS.texto) errores[campo] = 'textoLargo'
  }

  if (!datos.sectores.every(esSector) || new Set(datos.sectores).size !== datos.sectores.length) errores.sectores = 'sectorInvalido'
  else if (datos.sectores.length > LIMITES_HISTORIAS.sectoresMax) errores.sectores = 'demasiadosSectores'

  if (hayTexto(datos) && !datos.aceptaMostrar) errores.aceptaMostrar = 'faltaPermiso'
  return errores
}

/** Marca o desmarca un sector respetando el tope; si ya está al tope, no añade */
export function alternarSector(actuales: SectorId[], sector: SectorId): SectorId[] {
  if (actuales.includes(sector)) return actuales.filter((actual) => actual !== sector)
  return actuales.length >= LIMITES_HISTORIAS.sectoresMax ? actuales : [...actuales, sector]
}

/** Solo se llama con datos que ya pasaron `validarHistorias`: recorta los textos y deja los sectores en el orden de la lista */
export function limpiarHistorias(datos: EntradaHistorias): DatosHistorias {
  return {
    logro: datos.logro.trim(),
    problemaDificil: datos.problemaDificil.trim(),
    problemaMundo: datos.problemaMundo.trim(),
    sectores: sectores.filter((sector) => datos.sectores.includes(sector)),
    aceptaMostrar: datos.aceptaMostrar,
  }
}
