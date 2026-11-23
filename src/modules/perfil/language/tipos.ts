export type TextosPerfil = {
  metadatos: { titulo: string; descripcion: string }
  titulo: string
  subtitulo: string
  errorCarga: string
  verComoMeVen: string
  vistaPrevia: { titulo: string; nota: string; cerrar: string }
  ficha: { etiqueta: string; avatar: string }
  completaTuPerfil: string
  editar: string
  /** Lleva {paso}: el nombre del paso del recorrido donde se corrige */
  editarEn: string
  sobreMi: {
    titulo: string
    vacio: string
    escribir: string
    /** Nombre accesible del cuadro de texto */
    etiqueta: string
    placeholder: string
    /** Lleva {max} */
    ayuda: string
    guardar: string
    cancelar: string
    guardando: string
    /** Lleva {max} */
    errorTextoLargo: string
  }
  trayectoria: {
    titulo: string
    opcional: string
    vacio: string
    sumar: string
    /** Lo que se ve donde falta el año de término, por ejemplo «2022 – hoy» */
    hoy: string
    campos: { desde: string; hasta: string; rol: string; donde: string; que: string }
    guardar: string
    guardando: string
    listo: string
    quitar: string
    /** Lleva {n} y {max} */
    contador: string
    errores: {
      desde: string
      hasta: string
      rol: string
      donde: string
      /** Lleva {max} */
      textoLargo: string
      /** Lleva {max} */
      demasiadas: string
    }
  }
  evidencia: {
    titulo: string
    vacio: string
    sumar: string
    /** Nombre accesible del campo del enlace */
    campo: string
    placeholder: string
    agregar: string
    guardando: string
    quitar: string
    listo: string
    /** Lleva {n} y {max} */
    contador: string
    ayuda: string
    errores: {
      enlaceInvalido: string
      /** Lleva {max} */
      enlaceLargo: string
      repetido: string
      /** Lleva {max} */
      demasiados: string
    }
  }
  avisos: { limite: string; fallo: string }
  habilidades: {
    titulo: string
    otras: string
    estimado: string
    /** Lleva {n} */
    nivel: string
    sinDetalle: string
  }
  /** Lleva {n} y {total}: cuántas tareas marcó de todas las que hay */
  tareas: { titulo: string }
  sinEscribir: string
  sinEscribirPaso: string
  avance: {
    /** Lleva {n} y {total} */
    titulo: string
    ayuda: string
    capas: { recorrido: string; sobreMi: string; evidencia: string }
  }
  tarjeta: { busca: string }
}
