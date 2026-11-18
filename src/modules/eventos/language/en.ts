import type { TextosEventos } from './tipos'

export const en: TextosEventos = {
  metadatos: {
    titulo: 'Events | Nómadas',
    descripcion:
      'Upcoming Nómadas events: in-person meetups with activities and matching to find your founding team.',
  },
  hero: {
    etiqueta: 'Events',
    titulo: 'Upcoming events',
    parrafo:
      'Meeting in person changes everything. At each event we run activities so you can see how each person thinks, talk to the people the match suggests and find your team.',
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
  masEventos: {
    etiquetaSeccion: 'More events',
    contador: '{cantidad} events',
    verMas: 'See more events',
    mostrando: 'Showing {mostrados} of {total}',
  },
}
