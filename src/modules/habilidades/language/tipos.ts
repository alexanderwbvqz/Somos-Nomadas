import type { Camino } from '../domain/camino'
import type { GrupoId, HabilidadId } from '../domain/catalogo'
import type { SectorId } from '../domain/historias'
import type { CampoEnlace, CodigoErrorMaterial } from '../domain/material'
import type { Frecuencia } from '../domain/puntos'
import type { FuenteSugerencia, TareaId } from '../domain/tarea'

export type TextosHabilidades = {
  /** Lo que comparten varias pantallas del recorrido */
  comun: {
    /** Lleva {actual} y {total}, por ejemplo "Paso 1 de 5" */
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
  /** «Qué has hecho»: marcar las tareas que ya hizo y cuántas veces */
  tareas: {
    metadatos: { titulo: string; descripcion: string }
    titulo: string
    subtitulo: string
    porQue: string
    /** El nombre de cada grupo de tareas; no dicen de qué área son */
    grupos: Record<GrupoId, string>
    /** Lleva {n} y {total}: cuántas tareas del grupo hay marcadas */
    contadorGrupo: string
    /** Lleva {n} y {total}: cuántas tareas hay marcadas en total */
    contadorTotal: string
    cuantasVeces: string
    /** Lleva {tarea}: nombre accesible de las opciones de cuántas veces la hizo */
    vecesDe: string
    frecuencias: Record<Frecuencia, string>
    /** La tarea por la que se pregunta de cada habilidad */
    tareas: Record<HabilidadId, string>
    atras: string
    siguiente: string
    guardando: string
    /** Mientras no haya ninguna tarea marcada */
    minimo: string
    avisos: { limite: string; fallo: string }
  }
  /** «Tus historias»: lo que cuenta con sus palabras, los sectores que le mueven y el permiso para analizarlo */
  historias: {
    metadatos: { titulo: string; descripcion: string }
    titulo: string
    subtitulo: string
    porQue: string
    campos: {
      logro: { etiqueta: string; ayuda: string; ejemplo: string }
      problemaDificil: { etiqueta: string; ayuda: string; ejemplo: string }
      problemaMundo: { etiqueta: string; ejemplo: string }
    }
    opcional: string
    nota: string
    sectores: {
      titulo: string
      /** Lleva {max} */
      ayuda: string
      /** Lleva {n} y {max} */
      contador: string
      nombres: Record<SectorId, string>
    }
    permiso: { texto: string; enlace: string }
    /** Llevan {max}, el largo máximo de un texto o el de sectores */
    errores: { textoLargo: string; faltaPermiso: string; demasiadosSectores: string; sectorInvalido: string }
    atras: string
    siguiente: string
    guardando: string
    avisos: { limite: string; fallo: string }
  }
  /** «Más de lo que haces»: preguntas de cada una de las tres habilidades más fuertes */
  profundizar: {
    metadatos: { titulo: string; descripcion: string }
    titulo: string
    subtitulo: string
    porQue: string
    /** Cuando todavía no marcó ninguna tarea */
    vacio: string
    volverATareas: string
    /** Lleva {n} y {total} */
    habilidadN: string
    /** Lleva {veces}, por ejemplo «es mi trabajo» */
    loHasHecho: string
    lista: string
    pendiente: string
    /** Lleva {habilidad} */
    siguienteHabilidad: string
    opcional: string
    atras: string
    siguiente: string
    guardando: string
    avisos: { limite: string; fallo: string }
    /** El nombre de cada habilidad */
    habilidades: Record<HabilidadId, string>
    preguntas: {
      /** Llevan {habilidad}, en minúscula: la pregunta nombra la habilidad de la que habla */
      tiempo: string
      quien: string
      textoGenerico: { pregunta: string; ejemplo: string }
      /** El enunciado de cada pregunta propia de una habilidad, por su id */
      propias: Record<string, string>
      /** La pregunta de texto de las habilidades que tienen las suyas */
      textoPropio: Record<string, { pregunta: string; ejemplo: string }>
      /** El texto de cada opción, por su id: no se repite ninguno entre preguntas */
      opciones: Record<string, string>
    }
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
