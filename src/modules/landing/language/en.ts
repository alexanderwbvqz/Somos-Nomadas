import type { TextosLanding } from './tipos'

export const en: TextosLanding = {
  cabecera: {
    logoAlt: 'Nómadas',
    navegacionPrincipal: 'Main navigation',
    postular: 'Apply',
  },
  pie: {
    descripcion: 'An open community that connects entrepreneurs with complementary talent to found companies.',
    registrados: 'people registered',
    explorar: { titulo: 'Explore', directorio: 'Directory', match: 'Match connections', eventos: 'In-person events' },
    ecosistema: { titulo: 'Ecosystem', red: 'Ally network', postular: 'Apply as an ally' },
    privacidad: { titulo: 'Privacy', politica: 'Data policy', terminos: 'Community terms' },
    avisoAntes: 'We use your personal data only to connect founders with each other. More information in the',
    avisoEnlace: 'data policy',
    avisoDespues: '.',
    copyright: '© {anio} Nómadas. All rights reserved.',
    contacto: 'Contact',
    redes: 'Social media',
    idioma: 'Language',
  },
  hero: {
    tituloInicio: 'Great projects are born when they find the',
    tituloResaltado: 'right people.',
    parrafo:
      'Nómadas is a free community of entrepreneurs looking for co-founders. We bring together people from Technology, Marketing & Sales, Operations and Finance, and use artificial intelligence to suggest who best complements your idea. Then we meet in person, at events with activities that help you get to know each other and discover who leads.',
    botonPrincipal: 'Find your team',
    enlaceSecundario: 'Explore directory',
    etiquetaAliados: 'Companies that support us',
    ventajas: ['100% free', 'AI matching', 'In-person events'],
  },
  problemas: {
    tituloInicio: 'Ideas are everywhere.',
    tituloFin: 'The teams that build them are not.',
    subtitulo:
      'Many entrepreneurs have an idea but no team. At Nómadas we replace the randomness of events and coffee chats with connections based on real compatibility: complementary profiles, time commitment and shared values.',
    etiquetaProblema: 'The common problem',
    etiquetaSolucion: 'The Nómadas solution',
    diagrama: {
      descripcion: 'The four areas overlap to form a complete team',
      pie: 'Four areas, one complete team.',
      tecnologia: 'Technology',
      marketing: 'Marketing & Sales',
      operaciones: 'Operations',
      finanzas: 'Finance',
      equipo: 'Team',
      roles: {
        tecnologia: 'builds the product',
        marketing: 'gets it to customers',
        operaciones: 'makes everything work',
        finanzas: 'looks after the money',
      },
    },
    items: {
      networking: {
        tema: 'Networking',
        titulo: 'Random networking',
        problema:
          'Meeting people at large events leaves hundreds of contacts and no deep conversation about vision or commitment.',
        solucion: 'We suggest up to 10 connections by affinity, each with a question to break the ice.',
      },
      perfiles: {
        tema: 'Profiles',
        titulo: 'Repeated or unbalanced teams',
        problema: 'Two technical profiles with no one to sell, or two salespeople with no one to build.',
        solucion: 'We classify each person into one of four areas so that teams complement each other.',
      },
      equipo: {
        tema: 'Team',
        titulo: 'Not knowing how your partner reacts',
        problema:
          'Starting with someone without seeing how they decide under pressure, in a disagreement or in a cash crunch.',
        solucion: 'At our in-person events you see how each person thinks before you commit.',
      },
      respaldo: {
        tema: 'Support',
        titulo: 'Starting without support',
        problema: 'New founders lose months looking for advisors, tools and workspaces.',
        solucion: 'A network of mentors, organizers and allies supports the teams.',
      },
    },
  },
  match: {
    etiqueta: 'Match engine',
    tituloInicio: 'Designed to build teams,',
    tituloResaltado: 'not to collect contacts.',
    parrafo:
      'We compare what each person says about themselves, not just their labels: the system understands when two descriptions mean similar things even if they use different words. The result is up to 10 connections ranked by affinity.',
    puntos: [
      'We only suggest people who confirmed they are attending the event, so every connection is with someone who will be there.',
      'Each connection arrives with a question written for that person to break the ice.',
    ],
    panel: {
      titulo: 'How your list is built',
      insignia: 'Up to {total} connections',
      etiquetaSelector: 'Choose your area',
      etiquetaPropia: 'your area',
      etiquetaCantidad: 'up to {cantidad}',
      etiquetaConexion: 'A connection · {area}',
      afinidad: 'High affinity',
      pregunta: '“What problem in the world would you solve if you had a million dollars?”',
      notaEjemplo: 'Illustrative example for a person in {area}.',
    },
  },
  pilares: {
    etiqueta: 'The 4 pillars',
    tituloInicio: 'Every team needs all four,',
    tituloResaltado: 'and today we are looking for more than two.',
    parrafo:
      'A complete founding team combines these four disciplines. Today the community has many Technology and Marketing & Sales profiles, and we are looking for more Operations and Finance.',
    estado: 'Applications open',
    botonPostular: 'Apply',
    enlacePerfiles: 'View profiles',
    areas: {
      tecnologia: {
        descripcion:
          'Developers, data and AI specialists and product leaders who turn an idea into a working product.',
        claves: ['Development', 'Data & AI', 'Product'],
      },
      marketing: {
        descripcion:
          'Growth, B2B sales and product marketing to win the first customers and validate the offer.',
        claves: ['Growth', 'B2B sales', 'Brand'],
      },
      operaciones: {
        descripcion: 'Logistics, processes, regulatory compliance and support so the company grows in an orderly way.',
        claves: ['Processes', 'Logistics', 'Legal'],
      },
      finanzas: {
        descripcion:
          'Financial models, funding rounds, metrics and cash flow so the project is sustainable.',
        claves: ['Modeling', 'Investment', 'Cash flow'],
      },
    },
  },
  aliados: {
    etiqueta: 'Allies',
    tituloInicio: 'No team grows alone.',
    tituloResaltado: 'A network backs them.',
    parrafo:
      'Mentors, organizers and strategic partners support founders with experience, spaces and capital. Any person or organization can apply to join.',
    botonAliado: 'I want to be an ally',
    enlaceRed: 'See the ally network',
    nota: 'We review every application before publishing it, to keep the network high quality.',
    etiquetaActivos: 'Active allies',
    activoUno: '{cantidad} active',
    activoOtros: '{cantidad} active',
    tipos: {
      mentores: {
        nombre: 'Mentors',
        descripcion: 'They share their experience and guide founders through their first steps.',
        enlace: 'See mentors',
      },
      organizadores: {
        nombre: 'Organizers',
        descripcion: 'They provide the spaces, events and communities where nómadas meet.',
        enlace: 'See organizers',
      },
      estrategicos: {
        nombre: 'Strategic partners',
        descripcion: 'Companies, universities and capital that power the projects.',
        enlace: 'See partners',
      },
    },
  },
  cifras: {
    titulo: 'Why the team matters',
    parrafo:
      'The data points the same way: complete teams go further. These are some of the figures that make us bet on connecting the right people.',
    etiquetaLista: 'Figures about teams and startups',
    items: {
      capitalRiesgo: 'of venture-backed startups never return cash to their investors',
      fundadoresSolos: 'of startups that raise capital have a single founder, versus {comparado}% of new ones',
      equipoInadecuado: 'fail because they lack the right team',
      capitalEquipoCompleto: 'more capital with technical and business teams',
      capitalMentores: 'more capital with mentors and metrics tracking',
      registrados: 'people registered in the community',
    },
  },
}
