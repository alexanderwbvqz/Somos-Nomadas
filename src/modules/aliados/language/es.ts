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
}
