import type { AreaId, GrupoId, HabilidadId } from '../domain/catalogo'
import type { PreguntaFormaId } from '../domain/forma'
import type { SectorId } from '../domain/historias'
import type { Frecuencia } from '../domain/puntos'

export type TextosHabilidades = {
  /** Lo que comparten varias pantallas del recorrido */
  comun: {
    /** Lleva {actual} y {total}, por ejemplo "Paso 1 de 4" */
    paso: string
    saltar: string
    /** Lleva {n} con dos cifras, por ejemplo "Paso 02"; va encima del título de cada paso */
    numeroPaso: string
    /** El rótulo del porqué de cada paso */
    porQue: string
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
  /** «Tu forma de emprender»: seis preguntas de elegir, el perfil que busca y su socio ideal */
  forma: {
    metadatos: { titulo: string; descripcion: string }
    titulo: string
    subtitulo: string
    porQue: string
    /** El enunciado de cada pregunta */
    preguntas: Record<PreguntaFormaId, string>
    /** El título y la frase de cada opción, por su id: no se repite ninguno entre preguntas */
    opciones: Record<string, { titulo: string; texto: string }>
    /** Nombre accesible de los puntos de progreso; lleva {n} y {total} */
    progreso: string
    elegir: string
    elegido: string
    anterior: string
    saltar: string
    siguientePregunta: string
    /** Lleva {n} y {total} */
    resumen: string
    /** Lleva {n} y {total} */
    listo: string
    cambiar: string
    busca: { titulo: string; ayuda: string; areas: Record<AreaId, string> }
    socio: { etiqueta: string; ejemplo: string }
    opcional: string
    errores: { textoLargo: string }
    atras: string
    terminar: string
    guardando: string
    avisos: { limite: string; fallo: string }
  }
  /** Pantalla de cierre del recorrido: espera, y luego dos caminos (descubrir nómadas o revisar su perfil) */
  cierre: {
    metadatos: { titulo: string; descripcion: string }
    /** Nombre accesible del logo */
    logoAlt: string
    /** Nombre accesible de las iniciales de la persona */
    avatar: string
    esperaTitulo: string
    esperaTexto: string
    listoTitulo: string
    listoTexto: string
    descubrir: string
    revisarPerfil: string
    /** Insignia de lo que todavía no existe */
    pronto: string
    inicio: string
    fallo: { titulo: string; texto: string }
    reintentar: string
  }
  /** «Tus historias»: lo que cuenta con sus palabras, los sectores que le mueven y el permiso para mostrarlo en su perfil */
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
}
