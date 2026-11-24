import {
  completarUrl,
  contarPalabras,
  LIMITES,
  normalizarWhatsapp,
  type DatosPostulacion,
} from './postulacion'
import { urlSegura } from './detalle'

// Qué parte del perfil público va quedando completa mientras la persona rellena el formulario.
// Alimenta la lista "qué aparece y dónde" y el avance de la barra del móvil.

export type PartesPerfil = {
  nombreYTipo: boolean
  descripcionCorta: boolean
  detalle: boolean
  presencia: boolean
  contacto: boolean
}

function urlValida(texto: string): string | undefined {
  return texto.trim() === '' ? undefined : urlSegura(completarUrl(texto))
}

/** Las formas de contacto directo que ya son válidas */
export function contactoValido(datos: DatosPostulacion): { whatsapp: boolean; agenda: boolean } {
  return {
    whatsapp: normalizarWhatsapp(datos.whatsapp) !== undefined,
    agenda: urlValida(datos.enlaceAgenda) !== undefined,
  }
}

/** "https://www.cowork.com/" → "cowork.com"; undefined si el enlace no es válido */
export function sitioParaMostrar(texto: string): string | undefined {
  const url = urlValida(texto)
  return url ? new URL(url).hostname.replace(/^www\./, '') : undefined
}

export function partesDelPerfil(datos: DatosPostulacion): PartesPerfil {
  const palabras = contarPalabras(datos.descripcionCorta)
  const hayLista = (lista: string[]) => lista.some((elemento) => elemento.trim() !== '')
  const contacto = contactoValido(datos)

  return {
    nombreYTipo: datos.tipo !== '' && datos.nombre.trim() !== '',
    descripcionCorta: palabras >= LIMITES.palabrasMin && palabras <= LIMITES.palabrasMax,
    detalle:
      datos.descripcionLarga.trim() !== '' ||
      hayLista(datos.apoyos) ||
      hayLista(datos.areas) ||
      datos.paraQuien.trim() !== '' ||
      datos.datosClave.some((dato) => dato.valor.trim() !== '' && dato.etiqueta.trim() !== ''),
    presencia:
      datos.ciudad.trim() !== '' ||
      urlValida(datos.sitioWeb) !== undefined ||
      urlValida(datos.linkedin) !== undefined ||
      urlValida(datos.instagram) !== undefined,
    contacto: contacto.whatsapp || contacto.agenda,
  }
}

export function contarPartesListas(partes: PartesPerfil): number {
  return Object.values(partes).filter(Boolean).length
}

export const TOTAL_PARTES_PERFIL = 5
