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
      'A rede de aliados reúne as pessoas e organizações que apoiam a Nómadas. Os mentores acompanham os fundadores com a sua experiência, os organizadores oferecem os espaços, eventos e comunidades onde nos encontramos, e os aliados estratégicos somam empresas, universidades e capital que impulsionam os projetos. Cada aliado passa por uma revisão da equipe antes de ser publicado.',
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
  llamado: {
    tituloInicio: 'A sua organização pode',
    tituloResaltado: 'impulsionar equipes?',
    boton: 'Quero ser aliado',
    nota: 'Revisamos cada candidatura antes de publicá-la, para cuidar da qualidade da rede.',
  },
}
