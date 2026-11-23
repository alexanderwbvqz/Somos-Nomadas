import type { Camino } from '../domain/camino'

export type TextosHabilidades = {
  inicio: {
    metadatos: { titulo: string; descripcion: string }
    /** Lleva {actual} y {total}, por ejemplo "Paso 1 de 6" */
    paso: string
    saltar: string
    /** Lleva {nombre} */
    saludo: string
    /** El saludo cuando no se sabe el nombre */
    saludoSinNombre: string
    subtitulo: string
    /** Nombre accesible del grupo de caminos */
    etiquetaCaminos: string
    caminos: Record<Camino, { titulo: string; texto: string; tiempo: string; etiqueta: string }>
    arrancar: string
    notaPublicar: string
    /** Aviso provisional mientras el paso siguiente no exista */
    proximo: string
  }
}
