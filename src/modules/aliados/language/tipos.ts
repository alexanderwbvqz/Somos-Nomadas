import type { TipoAliado } from '../domain/Aliado'

export type TextosAliados = {
  metadatos: {
    titulo: string
    descripcion: string
  }
  hero: {
    etiqueta: string
    titulo: string
    parrafo: string
  }
  listado: {
    etiquetaFiltro: string
    todos: string
    /** Nombre de cada tipo en plural (para el filtro) y en singular (para la tarjeta) */
    tipos: Record<TipoAliado, { plural: string; singular: string }>
    leerMas: string
    verMas: string
    /** Llevan {mostrados} y {total} */
    mostrando: string
    vacio: string
  }
  llamado: {
    tituloInicio: string
    tituloResaltado: string
    boton: string
    nota: string
  }
}
