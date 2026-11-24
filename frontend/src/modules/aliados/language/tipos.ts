import type { TipoAliado } from '../domain/Aliado'
import type { CodigoError } from '../domain/postulacion'

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
  detalle: {
    /** Lleva {nombre} */
    tituloPagina: string
    volver: string
    quienEs: string
    datosClave: string
    enQuePuedeAyudarte: string
    paraEquipos: string
    comoTrabajar: string
    pasos: { titulo: string; texto: string }[]
    masAliados: string
    ficha: { tipo: string; ciudad: string; sitioWeb: string; enLaRed: string; redes: string }
    agendar: string
    whatsapp: string
    notaContacto: string
    mensajeWhatsapp: string
  }
  postulacion: TextosPostulacion
}

type Texto = { titulo: string; texto: string }

/** Parte del perfil que se va completando; lleva dónde aparece y en qué paso se rellena */
type ParteVista = { texto: string; lugar: string }

export type TextosPostulacion = {
  metadatos: { titulo: string; descripcion: string }
  hero: { etiqueta: string; titulo: string; parrafo: string }
  como: { pasos: Texto[] }
  formulario: {
    etiquetaPasos: string
    pasos: { quien: string; aporte: string; contacto: string; enviar: string }
    anterior: string
    siguiente: string
    enviar: string
    enviando: string
    privado: string
    opcional: string
    avisoErrores: string
    /** Aviso cuando el servidor rechaza el envío por algún motivo que no es un campo */
    envio: { limite: string; fallo: string }
  }
  quien: {
    titulo: string
    subtitulo: string
    comoSumarte: string
    tipos: Record<TipoAliado, Texto>
    nombre: string
    nombreAyuda: string
    nombreEjemplo: string
    persona: string
    personaEjemplo: string
    correo: string
    correoEjemplo: string
    notaPrivada: string
  }
  aporte: {
    titulo: string
    subtitulo: string
    corta: string
    cortaAyuda: string
    /** Llevan {n} */
    palabras: string
    faltan: string
    sobran: string
    larga: string
    largaAyuda: string
    apoyos: string
    apoyoNumero: string
    anadirApoyo: string
    areas: string
    areasAyuda: string
    /** Lleva {area} */
    quitarArea: string
    paraQuien: string
    datosClave: string
    datoValor: string
    datoEtiqueta: string
    ejemploValor: string
    ejemploEtiqueta: string
    anadirDato: string
  }
  contacto: {
    titulo: string
    subtitulo: string
    ciudad: string
    sitioWeb: string
    linkedin: string
    instagram: string
    /** Ejemplo que se ve en el campo vacío */
    linkedinEjemplo: string
    instagramEjemplo: string
    directo: string
    directoNota: string
    whatsapp: string
    whatsappAyuda: string
    agenda: string
    agendaAyuda: string
    consentimiento: string
  }
  enviar: {
    titulo: string
    subtitulo: string
    resumen: { tipoNombre: string; contacto: string; aporte: string; presencia: string; contactoPublico: string }
    editar: string
    sinElegir: string
    sinNombre: string
    ninguno: string
    /** Llevan {n} */
    palabras: string
    apoyos: string
    areas: string
    whatsapp: string
    agenda: string
    y: string
    politicaInicio: string
    politicaEnlace: string
    politicaFin: string
  }
  confirmacion: {
    titulo: string
    texto: string
    estados: { pendiente: string; aprobada: string; publicada: string }
    nota: string
    volver: string
  }
  vista: {
    titulo: string
    tarjeta: string
    ficha: string
    pasos1y2: string
    paso3: string
    tuNombre: string
    tipo: string
    sinDescripcion: string
    leerMas: string
    fichaFilas: { tipo: string; ciudad: string; sitioWeb: string; redes: string }
    sinBotones: string
    agendar: string
    whatsapp: string
    donde: string
    partes: {
      nombreYTipo: ParteVista
      descripcionCorta: ParteVista
      detalle: ParteVista
      presencia: ParteVista
      contacto: ParteVista
    }
    privadas: ParteVista
    /** Lleva {n} */
    paso: string
    barraTitulo: string
    /** Llevan {listos} y {total} */
    barraAvance: string
    cerrar: string
    /** Estado de cada parte del perfil, para lectores de pantalla */
    listo: string
    pendiente: string
  }
  /** Mensaje de cada error de un campo; algunos llevan {min} o {max} */
  errores: Record<CodigoError, string>
}
