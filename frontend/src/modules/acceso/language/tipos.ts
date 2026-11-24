type Metadatos = { titulo: string; descripcion: string }

export type TextosAcceso = {
  /** Campos que comparten el registro y el inicio de sesión */
  campos: {
    correo: string
    correoEjemplo: string
    clave: string
    mostrar: string
    ocultar: string
  }
  /** Mensaje de cada error; los de "correo" y "clave" son los de campo obligatorio. Algunos llevan {min} */
  errores: {
    correo: string
    clave: string
    correoInvalido: string
    claveCorta: string
    claveLarga: string
    politicaRequerida: string
  }
  /** Avisos cuando el servidor no puede completar lo pedido */
  avisos: { limite: string; fallo: string; google: string }
  /** Entrar con Google */
  google: {
    continuar: string
    separador: string
  }
  registro: {
    metadatos: Metadatos
    etiqueta: string
    titulo: string
    parrafo: string
    pasos: { titulo: string; texto: string }[]
    tarjeta: { titulo: string; intro: string }
    correoAyuda: string
    fuerza: { minimo: string; muyCorta: string; aceptable: string; buena: string; fuerte: string }
    politicaInicio: string
    politicaEnlace: string
    enviar: string
    enviando: string
    nota: string
    pie: { texto: string; enlace: string }
  }
  confirmacion: {
    etiqueta: string
    titulo: string
    parrafo: string
    tarjetaTitulo: string
    loEnviamosA: string
    nota: string
    reenviar: string
    cambiarCorreo: string
    /** Lleva {tiempo}, por ejemplo "0:30" */
    espera: string
    yaPuedes: string
    reenviado: string
    spam: string
  }
  inicio: {
    metadatos: Metadatos
    etiqueta: string
    titulo: string
    parrafo: string
    tarjeta: { titulo: string; intro: string }
    enviar: string
    enviando: string
    pie: { texto: string; enlace: string }
    credenciales: string
  }
  /** Lo que se ve al entrar (con correo o con Google), mientras no exista el panel */
  dentro: {
    etiqueta: string
    titulo: string
    /** Lleva {correo} */
    texto: string
    continuar: string
  }
}
