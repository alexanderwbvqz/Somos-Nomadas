import type { TextosAliados } from './tipos'

export const pt: TextosAliados = {
  metadatos: {
    titulo: 'Rede de aliados | Nómadas',
    descripcion:
      'Mentores, organizadores e aliados estratégicos que apoiam a Nómadas com experiência, espaços e capital.',
  },
  hero: {
    etiqueta: 'Aliados',
    titulo: 'Rede de aliados',
    parrafo:
      'Mentores, organizadores e aliados estratégicos que apoiam a comunidade com experiência, espaços e capital para que cada equipe chegue mais longe.',
  },
  listado: {
    etiquetaFiltro: 'Filtrar por tipo',
    todos: 'Todos',
    tipos: {
      mentores: { plural: 'Mentores', singular: 'Mentor' },
      organizadores: { plural: 'Organizadores', singular: 'Organizador' },
      estrategicos: { plural: 'Aliados estratégicos', singular: 'Aliado estratégico' },
    },
    leerMas: 'Ler mais',
    verMas: 'Ver mais aliados',
    mostrando: 'Mostrando {mostrados} de {total}',
    vacio: 'Ainda não há aliados deste tipo.',
  },
}
