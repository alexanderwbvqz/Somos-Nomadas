import type { CodigoPais } from '../domain/cuenta'

type Metadatos = { titulo: string; descripcion: string }

export type TextosAcceso = {
  /** Nombre de cada país en el idioma de la persona */
  paises: Record<CodigoPais, string>
  /** Campos que comparten el registro y el inicio de sesión */
  campos: {
    correo: string
    correoEjemplo: string
    clave: string
    mostrar: string
    ocultar: string
  }
  /** Mensaje de cada error; los de "obligatorio" tienen uno por campo. Algunos llevan {min} */
  errores: {
    nombre: string
    apellidos: string
    pais: string
    correo: string
    clave: string
    muyLargo: string
    correoInvalido: string
    claveCorta: string
    claveLarga: string
    politicaRequerida: string
  }
  /** Avisos cuando el servidor no puede completar lo pedido */
  avisos: { limite: string; fallo: string }
  registro: {
    metadatos: Metadatos
    etiqueta: string
    titulo: string
    parrafo: string
    pasos: { titulo: string; texto: string }[]
    tarjeta: { titulo: string; intro: string }
    nombre: string
    nombreEjemplo: string
    apellidos: string
    apellidosEjemplo: string
    pais: string
    paisElige: string
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
    /** Lo que se ve al entrar, mientras no exista el panel */
    dentro: { titulo: string; texto: string; volver: string }
  }
}
