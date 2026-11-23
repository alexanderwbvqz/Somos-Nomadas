import type { Camino } from '../domain/camino'
import type { CampoEnlace, CodigoErrorMaterial } from '../domain/material'
import type { FuenteSugerencia, TareaId } from '../domain/tarea'

export type TextosHabilidades = {
  /** Lo que comparten varias pantallas del recorrido */
  comun: {
    /** Lleva {actual} y {total}, por ejemplo "Paso 1 de 6" */
    paso: string
    saltar: string
    /** Aviso provisional mientras el paso siguiente no exista */
    proximo: string
  }
  inicio: {
    metadatos: { titulo: string; descripcion: string }
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
  }
  /** Subir un PDF o pegar enlaces, y revisar lo que se entendió */
  escritas: {
    metadatos: { titulo: string; descripcion: string }
    cambiarCamino: string
    titulo: string
    subtitulo: string
    archivo: {
      titulo: string
      /** Lleva {max}, el tamaño máximo en MB */
      ayuda: string
      linkedin: string
      quitar: string
    }
    separador: string
    opcional: string
    enlaces: Record<CampoEnlace, { etiqueta: string; ejemplo: string }>
    otroAyuda: string
    permisoTexto: string
    permisoEnlace: string
    analizar: string
    pie: string
    /** Mensaje de cada error; el de archivoGrande lleva {max} */
    errores: Record<CodigoErrorMaterial, string>
    avisos: { limite: string; fallo: string }
    leyendo: { titulo: string; texto: string }
    revision: {
      titulo: string
      subtitulo: string
      /** Lleva {nivel} */
      nivel: string
      /** De dónde salió cada sugerencia */
      fuentes: Record<FuenteSugerencia, string>
      /** Lleva {n} y {total} */
      contador: string
      confirmar: string
      pie: string
      /** Cuando no se encontró ninguna tarea */
      vacio: string
      volver: string
    }
    /** Nombre de cada tarea del catálogo */
    tareas: Record<TareaId, string>
  }
}
