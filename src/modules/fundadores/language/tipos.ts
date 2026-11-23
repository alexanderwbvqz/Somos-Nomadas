import type { Busqueda, Pais } from '../domain/perfil'

export type TextosFundadores = {
  bienvenida: {
    metadatos: { titulo: string; descripcion: string }
    /** Lleva {actual} y {total}, por ejemplo "Paso 1 de 2" */
    paso: string
    titulo: string
    intro: string
    campos: {
      nombre: string
      nombreEjemplo: string
      apellidos: string
      apellidosEjemplo: string
      pais: string
      paisPlaceholder: string
      ciudad: string
      ciudadOpcional: string
      ciudadEjemplo: string
    }
    /** Nombre de cada país en este idioma */
    paises: Record<Pais, string>
    busca: {
      titulo: string
      ayuda: string
      opciones: Record<Busqueda, string>
    }
    errores: {
      nombre: string
      apellidos: string
      pais: string
      textoLargo: string
      busquedaVacia: string
    }
    /** Avisos cuando el servidor no puede completar lo pedido */
    avisos: { limite: string; fallo: string }
    enviar: string
    enviando: string
    /** Lo que se ve al guardar, mientras no exista el directorio */
    listo: {
      etiqueta: string
      /** Lleva {nombre} */
      titulo: string
      texto: string
      volver: string
    }
  }
}
