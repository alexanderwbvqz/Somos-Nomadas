import { tiposAliado, type DatoClave, type RedAliado, type TipoAliado } from './Aliado'
import { esIdReservado, numeroWhatsappValido, urlSegura } from './detalle'

// Datos de una postulación para entrar a la red de aliados, tal como los escribe la persona.
// La validación es una sola y la usan el formulario (para avisar mientras escribe) y el servidor (que no se fía del navegador).

export const LIMITES = {
  palabrasMin: 20,
  palabrasMax: 40,
  nombre: 80,
  persona: 80,
  correo: 120,
  descripcionLarga: 1500,
  paraQuien: 200,
  ciudad: 80,
  url: 300,
  apoyo: 160,
  area: 40,
  datoValor: 40,
  datoEtiqueta: 60,
  maxApoyos: 4,
  maxAreas: 6,
  maxDatosClave: 4,
} as const

export type DatosPostulacion = {
  tipo: TipoAliado | ''
  nombre: string
  /** Privado: solo lo ve el equipo */
  personaContacto: string
  /** Privado: solo lo ve el equipo */
  correo: string
  descripcionCorta: string
  descripcionLarga: string
  apoyos: string[]
  areas: string[]
  paraQuien: string
  datosClave: DatoClave[]
  ciudad: string
  sitioWeb: string
  linkedin: string
  instagram: string
  whatsapp: string
  enlaceAgenda: string
  consentimientoWhatsapp: boolean
  aceptaPolitica: boolean
  /** Campo trampa: una persona no lo ve ni lo rellena; si trae algo, es un robot */
  sitioSecundario: string
}

export function datosPostulacionVacios(): DatosPostulacion {
  return {
    tipo: '',
    nombre: '',
    personaContacto: '',
    correo: '',
    descripcionCorta: '',
    descripcionLarga: '',
    apoyos: [''],
    areas: [],
    paraQuien: '',
    datosClave: [{ valor: '', etiqueta: '' }],
    ciudad: '',
    sitioWeb: '',
    linkedin: '',
    instagram: '',
    whatsapp: '',
    enlaceAgenda: '',
    consentimientoWhatsapp: false,
    aceptaPolitica: false,
    sitioSecundario: '',
  }
}

export type CodigoError =
  | 'obligatorio'
  | 'correoInvalido'
  | 'muyLargo'
  | 'pocasPalabras'
  | 'muchasPalabras'
  | 'urlInvalida'
  | 'whatsappInvalido'
  | 'contactoRequerido'
  | 'consentimientoWhatsapp'
  | 'politicaRequerida'
  | 'demasiados'

/** El campo con problema → qué le pasa. "contacto" es el aviso de que falta WhatsApp o agenda. */
export type ErroresPostulacion = Partial<Record<keyof DatosPostulacion | 'contacto', CodigoError>>

export type PasoPostulacion = 1 | 2 | 3 | 4

export function contarPalabras(texto: string): number {
  const limpio = texto.trim()
  return limpio === '' ? 0 : limpio.split(/\s+/).length
}

export function esCorreoValido(correo: string): boolean {
  const limpio = correo.trim()
  return limpio.length <= LIMITES.correo && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(limpio)
}

/** "ejemplo.com" → "https://ejemplo.com"; lo que ya trae esquema se deja tal cual (y se comprueba después) */
export function completarUrl(texto: string): string {
  const limpio = texto.trim()
  return /^[a-z][a-z0-9+.-]*:/i.test(limpio) ? limpio : `https://${limpio}`
}

/** El WhatsApp con el formato que lo escriba la persona ("+51 973 356 545") → solo dígitos; undefined si no es válido */
export function normalizarWhatsapp(texto: string): string | undefined {
  const limpio = texto.trim()
  if (limpio === '' || /[^\d\s()+\-.]/.test(limpio)) return undefined
  return numeroWhatsappValido(limpio.replace(/\D/g, ''))
}

function urlNormalizada(texto: string, dominio?: string): string | undefined {
  if (texto.trim() === '') return undefined
  const url = urlSegura(completarUrl(texto))
  if (!url) return undefined
  if (dominio) {
    const host = new URL(url).hostname.toLowerCase()
    if (host !== dominio && !host.endsWith(`.${dominio}`)) return undefined
  }
  return url
}

function errorDeUrl(texto: string, dominio?: string): CodigoError | undefined {
  if (texto.trim() === '') return undefined
  if (texto.trim().length > LIMITES.url) return 'muyLargo'
  return urlNormalizada(texto, dominio) ? undefined : 'urlInvalida'
}

const demasiadoLargo = (texto: string, maximo: number) => texto.trim().length > maximo
const llenos = (lista: string[]) => lista.map((elemento) => elemento.trim()).filter((elemento) => elemento !== '')

export function validarPaso(datos: DatosPostulacion, paso: PasoPostulacion): ErroresPostulacion {
  const errores: ErroresPostulacion = {}

  if (paso === 1) {
    if (!(tiposAliado as readonly string[]).includes(datos.tipo)) errores.tipo = 'obligatorio'
    if (datos.nombre.trim() === '') errores.nombre = 'obligatorio'
    else if (demasiadoLargo(datos.nombre, LIMITES.nombre)) errores.nombre = 'muyLargo'
    if (datos.personaContacto.trim() === '') errores.personaContacto = 'obligatorio'
    else if (demasiadoLargo(datos.personaContacto, LIMITES.persona)) errores.personaContacto = 'muyLargo'
    if (datos.correo.trim() === '') errores.correo = 'obligatorio'
    else if (!esCorreoValido(datos.correo)) errores.correo = 'correoInvalido'
  }

  if (paso === 2) {
    const palabras = contarPalabras(datos.descripcionCorta)
    if (palabras === 0) errores.descripcionCorta = 'obligatorio'
    else if (palabras < LIMITES.palabrasMin) errores.descripcionCorta = 'pocasPalabras'
    else if (palabras > LIMITES.palabrasMax) errores.descripcionCorta = 'muchasPalabras'

    if (demasiadoLargo(datos.descripcionLarga, LIMITES.descripcionLarga)) errores.descripcionLarga = 'muyLargo'
    if (demasiadoLargo(datos.paraQuien, LIMITES.paraQuien)) errores.paraQuien = 'muyLargo'

    const apoyos = llenos(datos.apoyos)
    if (apoyos.length > LIMITES.maxApoyos) errores.apoyos = 'demasiados'
    else if (apoyos.some((apoyo) => apoyo.length > LIMITES.apoyo)) errores.apoyos = 'muyLargo'

    const areas = llenos(datos.areas)
    if (areas.length > LIMITES.maxAreas) errores.areas = 'demasiados'
    else if (areas.some((area) => area.length > LIMITES.area)) errores.areas = 'muyLargo'

    const datosClave = datos.datosClave.filter((dato) => dato.valor.trim() !== '' || dato.etiqueta.trim() !== '')
    if (datosClave.length > LIMITES.maxDatosClave) errores.datosClave = 'demasiados'
    else if (datosClave.some((dato) => dato.valor.trim() === '' || dato.etiqueta.trim() === '')) errores.datosClave = 'obligatorio'
    else if (datosClave.some((dato) => dato.valor.trim().length > LIMITES.datoValor || dato.etiqueta.trim().length > LIMITES.datoEtiqueta)) errores.datosClave = 'muyLargo'
  }

  if (paso === 3) {
    if (demasiadoLargo(datos.ciudad, LIMITES.ciudad)) errores.ciudad = 'muyLargo'
    const sitioWeb = errorDeUrl(datos.sitioWeb)
    if (sitioWeb) errores.sitioWeb = sitioWeb
    const linkedin = errorDeUrl(datos.linkedin, 'linkedin.com')
    if (linkedin) errores.linkedin = linkedin
    const instagram = errorDeUrl(datos.instagram, 'instagram.com')
    if (instagram) errores.instagram = instagram

    const hayWhatsapp = datos.whatsapp.trim() !== ''
    const whatsapp = normalizarWhatsapp(datos.whatsapp)
    if (hayWhatsapp && !whatsapp) errores.whatsapp = 'whatsappInvalido'
    const hayAgenda = datos.enlaceAgenda.trim() !== ''
    const agenda = errorDeUrl(datos.enlaceAgenda)
    if (agenda) errores.enlaceAgenda = agenda

    // Hace falta al menos una forma de contacto directo y válida
    if (!whatsapp && !(hayAgenda && !agenda)) errores.contacto = 'contactoRequerido'
    // Un número se publica solo con el consentimiento expreso de quien lo da
    if (whatsapp && !datos.consentimientoWhatsapp) errores.consentimientoWhatsapp = 'consentimientoWhatsapp'
  }

  if (paso === 4) {
    if (!datos.aceptaPolitica) errores.aceptaPolitica = 'politicaRequerida'
  }

  return errores
}

export function validarPostulacion(datos: DatosPostulacion): ErroresPostulacion {
  return { ...validarPaso(datos, 1), ...validarPaso(datos, 2), ...validarPaso(datos, 3), ...validarPaso(datos, 4) }
}

export function hayErrores(errores: ErroresPostulacion): boolean {
  return Object.keys(errores).length > 0
}

/** Un campo trampa relleno delata a un robot */
export function esRobot(datos: DatosPostulacion): boolean {
  return datos.sitioSecundario.trim() !== ''
}

/** "Cowork Plaza" → "cowork-plaza"; sin tildes, solo letras, números y guiones; nunca una ruta reservada */
export function generarId(nombre: string): string {
  const base = nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')
  if (base === '') return 'aliado'
  return esIdReservado(base) ? `${base}-aliado` : base
}

/** La postulación ya revisada y ordenada, lista para guardar. Ver `limpiarPostulacion`. */
export type PostulacionLimpia = {
  id: string
  tipo: TipoAliado
  nombre: string
  personaContacto: string
  correo: string
  descripcionCorta: string
  descripcionLarga: string[]
  apoyos: string[]
  areas: string[]
  paraQuien?: string
  datosClave: DatoClave[]
  ciudad?: string
  sitioWeb?: string
  redes: RedAliado[]
  /** Solo dígitos; únicamente si hay consentimiento para publicarlo */
  whatsapp?: string
  enlaceAgenda?: string
}

/** Ordena unos datos ya validados: sin espacios sobrantes, sin repetidos, enlaces completos y WhatsApp solo con dígitos. */
export function limpiarPostulacion(datos: DatosPostulacion): PostulacionLimpia {
  const vistas = new Set<string>()
  const areas = llenos(datos.areas).filter((area) => {
    const clave = area.toLowerCase()
    if (vistas.has(clave)) return false
    vistas.add(clave)
    return true
  })

  const redes: RedAliado[] = []
  const linkedin = urlNormalizada(datos.linkedin, 'linkedin.com')
  if (linkedin) redes.push({ tipo: 'linkedin', href: linkedin })
  const instagram = urlNormalizada(datos.instagram, 'instagram.com')
  if (instagram) redes.push({ tipo: 'instagram', href: instagram })

  const whatsapp = datos.consentimientoWhatsapp ? normalizarWhatsapp(datos.whatsapp) : undefined
  const paraQuien = datos.paraQuien.trim()
  const ciudad = datos.ciudad.trim()

  return {
    id: generarId(datos.nombre),
    tipo: datos.tipo as TipoAliado,
    nombre: datos.nombre.trim(),
    personaContacto: datos.personaContacto.trim(),
    correo: datos.correo.trim().toLowerCase(),
    descripcionCorta: datos.descripcionCorta.trim().replace(/\s+/g, ' '),
    descripcionLarga: datos.descripcionLarga
      .split(/\n\s*\n/)
      .map((parrafo) => parrafo.trim().replace(/\s+/g, ' '))
      .filter((parrafo) => parrafo !== ''),
    apoyos: llenos(datos.apoyos),
    areas,
    ...(paraQuien ? { paraQuien } : {}),
    datosClave: datos.datosClave
      .map((dato) => ({ valor: dato.valor.trim(), etiqueta: dato.etiqueta.trim() }))
      .filter((dato) => dato.valor !== '' && dato.etiqueta !== ''),
    ...(ciudad ? { ciudad } : {}),
    ...(urlNormalizada(datos.sitioWeb) ? { sitioWeb: urlNormalizada(datos.sitioWeb) } : {}),
    redes,
    ...(whatsapp ? { whatsapp } : {}),
    ...(urlNormalizada(datos.enlaceAgenda) ? { enlaceAgenda: urlNormalizada(datos.enlaceAgenda) } : {}),
  }
}
