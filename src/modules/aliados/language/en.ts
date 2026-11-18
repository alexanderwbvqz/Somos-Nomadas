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
}
