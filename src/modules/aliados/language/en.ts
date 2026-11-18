import type { TextosAliados } from './tipos'

export const en: TextosAliados = {
  metadatos: {
    titulo: 'Ally network | Nómadas',
    descripcion:
      'Mentors, organizers and strategic partners who back Nómadas with experience, spaces and capital.',
  },
  hero: {
    etiqueta: 'Allies',
    titulo: 'Ally network',
    parrafo:
      'The ally network brings together the people and organizations that back Nómadas. Mentors guide founders with their experience, organizers provide the spaces, events and communities where we meet, and strategic partners add companies, universities and capital that power the projects. Every ally is reviewed by the team before being published.',
  },
  listado: {
    etiquetaFiltro: 'Filter by type',
    todos: 'All',
    tipos: {
      mentores: { plural: 'Mentors', singular: 'Mentor' },
      organizadores: { plural: 'Organizers', singular: 'Organizer' },
      estrategicos: { plural: 'Strategic partners', singular: 'Strategic partner' },
    },
    leerMas: 'Read more',
    verMas: 'See more allies',
    mostrando: 'Showing {mostrados} of {total}',
    vacio: 'There are no allies of this type yet.',
  },
  llamado: {
    tituloInicio: 'Can your organization',
    tituloResaltado: 'power up teams?',
    boton: 'I want to be an ally',
    nota: 'We review every application before publishing it, to keep the network high quality.',
  },
  detalle: {
    tituloPagina: '{nombre} | Nómadas',
    volver: 'Ally network',
    quienEs: 'Who they are',
    datosClave: 'Key facts',
    enQuePuedeAyudarte: 'How they can help you',
    paraEquipos: 'Who it is for',
    comoTrabajar: 'How to work with this ally',
    pasos: [
      { titulo: 'Choose how to reach out', texto: 'Use the contact option on their profile, whichever suits you best.' },
      { titulo: 'Tell them about your project', texto: 'Explain where your team is and what you need, so they can prepare.' },
      { titulo: 'Talk', texto: 'Agree together how to continue: one session, several or a one-off conversation.' },
    ],
    masAliados: 'More allies of this type',
    ficha: { tipo: 'Type', ciudad: 'City', sitioWeb: 'Website', enLaRed: 'In the network since', redes: 'Social media' },
    agendar: 'Book a call',
    whatsapp: 'Message on WhatsApp',
    notaContacto: 'Direct contact with the ally: Nómadas is not involved in the conversation.',
    mensajeWhatsapp: 'Hi, I saw your profile in the Nómadas ally network and I would like to talk.',
  },
}
