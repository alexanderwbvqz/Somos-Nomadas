import type { TextosAliados } from './tipos'

export const es: TextosAliados = {
  metadatos: {
    titulo: 'Red de aliados | Nómadas',
    descripcion:
      'Mentores, organizadores y aliados estratégicos que respaldan a Nómadas con experiencia, espacios y capital.',
  },
  hero: {
    etiqueta: 'Aliados',
    titulo: 'Red de aliados',
    parrafo:
      'La red de aliados reúne a las personas y organizaciones que respaldan a Nómadas. Los mentores acompañan a los fundadores con su experiencia, los organizadores ponen los espacios, eventos y comunidades donde nos encontramos, y los aliados estratégicos suman empresas, universidades y capital que potencian a los proyectos. Cada aliado pasa por una revisión del equipo antes de publicarse.',
  },
  listado: {
    etiquetaFiltro: 'Filtrar por tipo',
    todos: 'Todos',
    tipos: {
      mentores: { plural: 'Mentores', singular: 'Mentor' },
      organizadores: { plural: 'Organizadores', singular: 'Organizador' },
      estrategicos: { plural: 'Aliados estratégicos', singular: 'Aliado estratégico' },
    },
    leerMas: 'Leer más',
    verMas: 'Ver más aliados',
    mostrando: 'Mostrando {mostrados} de {total}',
    vacio: 'Todavía no hay aliados de este tipo.',
  },
  llamado: {
    tituloInicio: '¿Tu organización puede',
    tituloResaltado: 'impulsar equipos?',
    boton: 'Quiero ser aliado',
    nota: 'Revisamos cada postulación antes de publicarla, para cuidar la calidad de la red.',
  },
  detalle: {
    tituloPagina: '{nombre} | Nómadas',
    volver: 'Red de aliados',
    quienEs: 'Quién es',
    datosClave: 'Datos clave',
    enQuePuedeAyudarte: 'En qué puede ayudarte',
    paraEquipos: 'Para quién es',
    comoTrabajar: 'Cómo trabajar con este aliado',
    pasos: [
      { titulo: 'Elige cómo contactar', texto: 'Usa el contacto que te ofrece en su ficha, el que te resulte más cómodo.' },
      { titulo: 'Cuéntale tu proyecto', texto: 'Explica en qué punto está tu equipo y qué necesitas, para que pueda prepararse.' },
      { titulo: 'Conversan', texto: 'Acuerdan juntos cómo seguir: una sesión, varias o una conversación puntual.' },
    ],
    masAliados: 'Más aliados de este tipo',
    ficha: { tipo: 'Tipo', ciudad: 'Ciudad', sitioWeb: 'Sitio web', enLaRed: 'En la red desde', redes: 'Redes' },
    agendar: 'Agendar una llamada',
    whatsapp: 'Escribir por WhatsApp',
    notaContacto: 'Contacto directo con el aliado: Nómadas no interviene en la conversación.',
    mensajeWhatsapp: 'Hola, vi tu perfil en la red de aliados de Nómadas y me gustaría conversar.',
  },
}
