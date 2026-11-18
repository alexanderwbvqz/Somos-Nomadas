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
      'Mentores, organizadores y aliados estratégicos que respaldan a la comunidad con experiencia, espacios y capital para que cada equipo llegue más lejos.',
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
}
