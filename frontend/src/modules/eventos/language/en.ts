import type { TextosEventos } from './tipos'

export const en: TextosEventos = {
  metadatos: {
    titulo: 'Events',
    descripcion:
      'Upcoming Nómadas events: in-person meetups with activities and matching to find your founding team.',
  },
  hero: {
    etiqueta: 'Events',
    titulo: 'Upcoming events',
    parrafo:
      'Events are the heart of Nómadas. You confirm your attendance with your WhatsApp, check in when you arrive and get the list of people it makes the most sense to talk to, each with a question to break the ice. We run activities to get to know each other better, and every connection is with someone who is in the room.',
  },
  proximo: {
    etiquetaSeccion: 'The next event',
    lugar: 'Place',
    hora: 'Time',
    confirmar: 'Confirm attendance',
    notaConfirmar: 'You confirm with your WhatsApp. That way we can suggest connections with the people attending.',
    mensajeConfirmar: 'Hi, I would like to confirm my attendance at the event “{evento}”.',
    hoy: 'Today',
    manana: 'Tomorrow',
    enDias: 'In {dias} days',
    modalidades: { presencial: 'In person', enlinea: 'Online' },
    sinEventosTitulo: 'There are no events scheduled right now',
    sinEventosTexto: 'Write to us and we will let you know as soon as there is one.',
    sinEventosBoton: 'Let me know',
    mensajeAvisar: 'Hi, I would like to be notified about the next Nómadas event.',
  },
  comoFunciona: {
    etiquetaSeccion: 'How an event works',
    pasos: [
      { titulo: 'Confirm', texto: 'You tell us on WhatsApp that you are coming, before the event.' },
      { titulo: 'Arrive', texto: 'You check in when you walk in, so we know who is in the room.' },
      { titulo: 'Connect', texto: 'You get your match connections, only with people who attended, and a question to start the conversation.' },
      { titulo: 'Take part', texto: 'Activities to discover how each person thinks before deciding who to build with.' },
    ],
  },
  llamado: {
    tituloInicio: 'Do you have a space or a community?',
    tituloResaltado: 'Host an event with us.',
    boton: 'I want to be an ally',
    nota: 'Organizers are part of the network: they provide the spaces and communities where nómadas meet.',
  },
  masEventos: {
    etiquetaSeccion: 'More events',
    contador: '{cantidad} events',
    verMas: 'See more events',
    mostrando: 'Showing {mostrados} of {total}',
  },
}
