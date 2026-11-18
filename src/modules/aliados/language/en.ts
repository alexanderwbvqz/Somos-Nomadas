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
      'Mentors, organizers and strategic partners who back the community with experience, spaces and capital so every team can go further.',
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
}
