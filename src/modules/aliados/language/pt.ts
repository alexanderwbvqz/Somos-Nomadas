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
  detalle: {
    tituloPagina: '{nombre} | Nómadas',
    volver: 'Rede de aliados',
    quienEs: 'Quem é',
    datosClave: 'Dados-chave',
    enQuePuedeAyudarte: 'Em que pode ajudar você',
    paraEquipos: 'Para quem é',
    comoTrabajar: 'Como trabalhar com este aliado',
    pasos: [
      { titulo: 'Escolha como entrar em contato', texto: 'Use o contato que ele oferece no perfil, o que for mais cômodo para você.' },
      { titulo: 'Conte o seu projeto', texto: 'Explique em que ponto está a sua equipe e o que você precisa, para que possa se preparar.' },
      { titulo: 'Conversem', texto: 'Combinem juntos como continuar: uma sessão, várias ou uma conversa pontual.' },
    ],
    masAliados: 'Mais aliados deste tipo',
    ficha: { tipo: 'Tipo', ciudad: 'Cidade', sitioWeb: 'Site', enLaRed: 'Na rede desde', redes: 'Redes' },
    agendar: 'Agendar uma chamada',
    whatsapp: 'Escrever pelo WhatsApp',
    notaContacto: 'Contato direto com o aliado: a Nómadas não intervém na conversa.',
    mensajeWhatsapp: 'Olá, vi o seu perfil na rede de aliados da Nómadas e gostaria de conversar.',
  },
}
