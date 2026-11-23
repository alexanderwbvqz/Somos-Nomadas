// Textos de la cabecera y el pie, que se ven en todas las páginas
export type TextosSitio = {
  cabecera: {
    logoAlt: string
    navegacionPrincipal: string
    postular: string
  }
  /** La barra de las páginas de la cuenta (perfil, descubrir…) */
  cuenta: {
    /** Nombre accesible de la lista de secciones */
    navegacion: string
    descubrir: string
    conversaciones: string
    guardados: string
    miPerfil: string
    /** Insignia de lo que todavía no existe */
    pronto: string
  }

  pie: {
    descripcion: string
    registrados: string
    explorar: { titulo: string; directorio: string; match: string; eventos: string }
    ecosistema: { titulo: string; red: string; postular: string }
    privacidad: { titulo: string; politica: string; terminos: string }
    avisoAntes: string
    avisoEnlace: string
    avisoDespues: string
    /** Lleva {anio} */
    copyright: string
    contacto: string
    redes: string
    idioma: string
  }
}
