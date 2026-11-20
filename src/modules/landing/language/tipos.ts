import type { TipoAliado } from '@/modules/aliados/domain/Aliado'
import type { ClaveCifra } from '../domain/cifras'
import type { ClaveArea } from '../domain/match'
import type { ClaveProblema } from '../domain/problemas'

export type TextoProblema = {
  tema: string
  titulo: string
  problema: string
  solucion: string
}

export type TextosLanding = {
  hero: {
    tituloInicio: string
    tituloResaltado: string
    parrafo: string
    botonPrincipal: string
    enlaceSecundario: string
    etiquetaAliados: string
    ventajas: string[]
  }
  problemas: {
    tituloInicio: string
    tituloFin: string
    subtitulo: string
    etiquetaProblema: string
    etiquetaSolucion: string
    diagrama: {
      descripcion: string
      pie: string
      tecnologia: string
      marketing: string
      operaciones: string
      finanzas: string
      equipo: string
      /** Lo que aporta cada área (propuesta, revisar) */
      roles: Record<'tecnologia' | 'marketing' | 'operaciones' | 'finanzas', string>
    }
    items: Record<ClaveProblema, TextoProblema>
  }
  match: {
    etiqueta: string
    tituloInicio: string
    tituloResaltado: string
    parrafo: string
    puntos: string[]
    panel: {
      titulo: string
      /** Lleva {total} */
      insignia: string
      etiquetaSelector: string
      etiquetaPropia: string
      /** Lleva {cantidad} */
      etiquetaCantidad: string
      /** Lleva {area} */
      etiquetaConexion: string
      afinidad: string
      pregunta: string
      /** Lleva {area} */
      notaEjemplo: string
    }
  }
  pilares: {
    etiqueta: string
    tituloInicio: string
    tituloResaltado: string
    parrafo: string
    estado: string
    botonPostular: string
    enlacePerfiles: string
    areas: Record<ClaveArea, { descripcion: string; claves: string[] }>
  }
  aliados: {
    etiqueta: string
    tituloInicio: string
    tituloResaltado: string
    parrafo: string
    botonAliado: string
    enlaceRed: string
    nota: string
    etiquetaActivos: string
    /** Llevan {cantidad} */
    activoUno: string
    activoOtros: string
    tipos: Record<TipoAliado, { nombre: string; descripcion: string; enlace: string }>
  }
  cifras: {
    titulo: string
    parrafo: string
    etiquetaLista: string
    items: Record<ClaveCifra, string>
  }
}
