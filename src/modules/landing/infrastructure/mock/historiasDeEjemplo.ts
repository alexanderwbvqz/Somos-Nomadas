import type { Historia, PersonaHistoria } from '../../domain/Historia'

// inventado / por verificar: historias de ejemplo para armar la sección. Cada una está redactada solo con lo que dicen sus fuentes
// (universidades, museos, revistas, aceleradoras o la propia empresa; nunca Wikipedia) y las citas se comprobaron en esas páginas,
// pero hay que volver a leerlas antes de publicar. El área de cada persona es una decisión editorial, porque las fuentes dan cargos
// y formación y no áreas. Las traducciones a en y pt son propuestas.
// Rappi se cuenta con lo que coinciden Semana, Y Combinator y LAVCA. Las fuentes se contradicen en la ciudad de origen y en los
// años de las empresas anteriores, y la amistad de colegio de Borrero y Mejía solo la cuenta un informe de análisis: por eso el
// texto no dice nada de eso ni de cómo se conocieron.
// Las fotos están en public/founders-legends/. Por verificar: de dónde salen, con qué licencia y con qué permiso se publican; la regla
// del dominio exige que sean archivos del propio sitio y que todas las personas de una historia lleven foto.

type Textos = Pick<Historia, 'combinacion' | 'frase' | 'parrafos' | 'fuentes'> & { aportes: string[] }

type HistoriaBase = {
  clave: string
  nombre: string
  anio: number
  areaFondo: Historia['areaFondo']
  /** Lo que no cambia con el idioma de cada persona; el aporte sale de los textos */
  personas: Omit<PersonaHistoria, 'aporte'>[]
  /** El español es obligatorio: es el que se usa si falta el idioma pedido */
  textos: { es: Textos } & Partial<Record<'en' | 'pt', Textos>>
}

const base: HistoriaBase[] = [
  {
    clave: 'apple',
    nombre: 'Apple',
    anio: 1977,
    areaFondo: 'marketing',
    personas: [
      { iniciales: 'SJ', nombre: 'Steve Jobs', area: 'marketing', foto: '/founders-legends/apple/steve_jobs.jfif' },
      { iniciales: 'SW', nombre: 'Steve Wozniak', area: 'tecnologia', foto: '/founders-legends/apple/steve_wosniak.jfif' },
    ],
    textos: {
      es: {
        combinacion: 'Ingeniería + Ventas',
        frase: { inicio: 'Uno construía los computadores. El otro', resaltado: 'los vendía', fin: '.' },
        aportes: ['Ventas y marketing', 'Diseño de los computadores'],
        parrafos: [
          'Steve Jobs y Steve Wozniak se conocieron en 1971, cuando un amigo en común, Bill Fernandez, presentó a Wozniak, de 21 años, con Jobs, de 16.',
          'Wozniak, sin formación formal en ingeniería, diseñó el computador Apple-1. Jobs vio que podía haber demanda más allá de los aficionados y consiguió un pedido de 50 máquinas de una tienda local, la Byte Shop.',
          'En enero de 1977 fundaron Apple Computer junto con Mike Markkula, un ingeniero retirado de Intel que invirtió 250.000 dólares.',
        ],
        fuentes: [{ texto: 'Computer History Museum: Steve Jobs, From Garage to World’s Most Valuable Company', href: 'https://computerhistory.org/blog/steve-jobs/' }],
      },
      en: {
        combinacion: 'Engineering + Sales',
        frase: { inicio: 'One built the computers. The other', resaltado: 'sold them', fin: '.' },
        aportes: ['Sales and marketing', 'Computer design'],
        parrafos: [
          'Steve Jobs and Steve Wozniak met in 1971, when a mutual friend, Bill Fernandez, introduced 21-year-old Wozniak to 16-year-old Jobs.',
          'Wozniak, who had no formal engineering training, designed the Apple-1 computer. Jobs saw there could be demand beyond hobbyists and won an order for 50 machines from a local store, the Byte Shop.',
          'In January 1977 they founded Apple Computer together with Mike Markkula, an engineer retired from Intel who invested $250,000.',
        ],
        fuentes: [{ texto: 'Computer History Museum: Steve Jobs, From Garage to World’s Most Valuable Company', href: 'https://computerhistory.org/blog/steve-jobs/' }],
      },
      pt: {
        combinacion: 'Engenharia + Vendas',
        frase: { inicio: 'Um construía os computadores. O outro', resaltado: 'os vendia', fin: '.' },
        aportes: ['Vendas e marketing', 'Projeto dos computadores'],
        parrafos: [
          'Steve Jobs e Steve Wozniak se conheceram em 1971, quando um amigo em comum, Bill Fernandez, apresentou Wozniak, de 21 anos, a Jobs, de 16.',
          'Wozniak, sem formação formal em engenharia, projetou o computador Apple-1. Jobs viu que poderia haver demanda além dos aficionados e conseguiu um pedido de 50 máquinas de uma loja local, a Byte Shop.',
          'Em janeiro de 1977 fundaram a Apple Computer junto com Mike Markkula, um engenheiro aposentado da Intel que investiu 250 mil dólares.',
        ],
        fuentes: [{ texto: 'Computer History Museum: Steve Jobs, From Garage to World’s Most Valuable Company', href: 'https://computerhistory.org/blog/steve-jobs/' }],
      },
    },
  },
  {
    clave: 'airbnb',
    nombre: 'Airbnb',
    anio: 2008,
    areaFondo: 'tecnologia',
    personas: [
      { iniciales: 'BC', nombre: 'Brian Chesky', area: 'tecnologia', foto: '/founders-legends/airbnb/brian_chesky.jfif' },
      { iniciales: 'JG', nombre: 'Joe Gebbia', area: 'tecnologia', foto: '/founders-legends/airbnb/joe_gebbia.jfif' },
      { iniciales: 'NB', nombre: 'Nathan Blecharczyk', area: 'tecnologia', foto: '/founders-legends/airbnb/nathan_blecharczyk.jpg' },
    ],
    textos: {
      es: {
        combinacion: 'Diseño + Computación',
        frase: { inicio: 'Dos diseñadores de RISD empezaron juntos en California. En 2008 se sumó', resaltado: 'un tercer socio', fin: '.' },
        aportes: ['Diseño industrial', 'Diseño gráfico e industrial', 'Ciencias de la computación'],
        parrafos: [
          'Brian Chesky se graduó en diseño industrial de la Rhode Island School of Design (RISD) en 2004, y Joe Gebbia, en diseño gráfico y diseño industrial, en 2005.',
          'Poco después de graduarse, Gebbia se fue a California con otro egresado de RISD, Chesky. Cuando les subieron el alquiler, pusieron un colchón inflable en el salón; ese fin de semana había en San Francisco una conferencia de diseño con todos los hoteles agotados.',
          'En agosto de 2008 relanzaron la idea, con Nathan Blecharczyk, licenciado en Ciencias de la Computación por Harvard, como tercer miembro del equipo. La empresa acabó llamándose Airbnb.',
        ],
        fuentes: [
          { texto: 'RISD: comunicado de prensa sobre Brian Chesky (2017)', href: 'https://www.risd.edu/news/for-press/press-releases/airbnb-co-founder-ceo-and-head-community-brian-chesky-deliver-keynote' },
          { texto: 'Core77: RISD Entrepreneur Mindshare, Joe Gebbia (2012)', href: 'https://core77.com/posts/23715/risd-entrepreneur-mindshare-joe-gebbia-says-to-take-the-next-step-23715' },
          { texto: 'Airbnb Newsroom: Nathan Blecharczyk', href: 'https://news.airbnb.com/about-us/leadership/nathan-blecharczyk/' },
        ],
      },
      en: {
        combinacion: 'Design + Computing',
        frase: { inicio: 'Two RISD designers started out together in California. In 2008', resaltado: 'a third partner', fin: ' joined.' },
        aportes: ['Industrial design', 'Graphic and industrial design', 'Computer science'],
        parrafos: [
          'Brian Chesky graduated in industrial design from the Rhode Island School of Design (RISD) in 2004, and Joe Gebbia, in graphic and industrial design, in 2005.',
          'Shortly after graduating, Gebbia headed to California with fellow RISD alumnus Chesky. When their rent went up, they put an air mattress in the living room; that weekend a design conference in San Francisco had every hotel sold out.',
          'In August 2008 they relaunched the idea, with Nathan Blecharczyk, who holds a bachelor’s degree in computer science from Harvard, as a third team member. The company came to be called Airbnb.',
        ],
        fuentes: [
          { texto: 'RISD: press release on Brian Chesky (2017)', href: 'https://www.risd.edu/news/for-press/press-releases/airbnb-co-founder-ceo-and-head-community-brian-chesky-deliver-keynote' },
          { texto: 'Core77: RISD Entrepreneur Mindshare, Joe Gebbia (2012)', href: 'https://core77.com/posts/23715/risd-entrepreneur-mindshare-joe-gebbia-says-to-take-the-next-step-23715' },
          { texto: 'Airbnb Newsroom: Nathan Blecharczyk', href: 'https://news.airbnb.com/about-us/leadership/nathan-blecharczyk/' },
        ],
      },
      pt: {
        combinacion: 'Design + Computação',
        frase: { inicio: 'Dois designers da RISD começaram juntos na Califórnia. Em 2008 entrou', resaltado: 'um terceiro sócio', fin: '.' },
        aportes: ['Design industrial', 'Design gráfico e industrial', 'Ciência da computação'],
        parrafos: [
          'Brian Chesky se formou em design industrial na Rhode Island School of Design (RISD) em 2004, e Joe Gebbia, em design gráfico e design industrial, em 2005.',
          'Pouco depois de se formar, Gebbia foi para a Califórnia com outro ex-aluno da RISD, Chesky. Quando o aluguel subiu, colocaram um colchão inflável na sala; naquele fim de semana, uma conferência de design em São Francisco deixou todos os hotéis lotados.',
          'Em agosto de 2008 relançaram a ideia, com Nathan Blecharczyk, bacharel em Ciência da Computação por Harvard, como terceiro membro da equipe. A empresa passou a se chamar Airbnb.',
        ],
        fuentes: [
          { texto: 'RISD: comunicado de imprensa sobre Brian Chesky (2017)', href: 'https://www.risd.edu/news/for-press/press-releases/airbnb-co-founder-ceo-and-head-community-brian-chesky-deliver-keynote' },
          { texto: 'Core77: RISD Entrepreneur Mindshare, Joe Gebbia (2012)', href: 'https://core77.com/posts/23715/risd-entrepreneur-mindshare-joe-gebbia-says-to-take-the-next-step-23715' },
          { texto: 'Airbnb Newsroom: Nathan Blecharczyk', href: 'https://news.airbnb.com/about-us/leadership/nathan-blecharczyk/' },
        ],
      },
    },
  },
  {
    clave: 'nike',
    nombre: 'Nike',
    anio: 1964,
    areaFondo: 'operaciones',
    personas: [
      { iniciales: 'PK', nombre: 'Phil Knight', area: 'marketing', foto: '/founders-legends/nike/phil_knight.png' },
      { iniciales: 'BB', nombre: 'Bill Bowerman', area: 'tecnologia', foto: '/founders-legends/nike/bill_bowerman.avif' },
    ],
    textos: {
      es: {
        combinacion: 'Ventas + Producto',
        frase: { inicio: 'Un corredor y su entrenador sellaron con un apretón de manos', resaltado: 'un negocio de zapatillas', fin: '.' },
        aportes: ['Importación y ventas', 'Diseño del calzado'],
        parrafos: [
          'Phil Knight corría en el equipo de atletismo de la Universidad de Oregón, entrenado por Bill Bowerman, que fue para él mentor, entrenador y amigo.',
          'El 25 de enero de 1964 almorzaron en un hotel de Portland para hablar de una posible sociedad y se dieron la mano sobre la mesa. Nacía Blue Ribbon Sports, el antecesor de Nike.',
          'Knight se encargó de importar zapatillas japonesas y de venderlas, al principio desde su auto; Bowerman, de mejorar el calzado: sus innovaciones llegaron a sumar ocho patentes.',
        ],
        fuentes: [
          { texto: 'Nike: The Handshake That Started It All', href: 'https://about.nike.com/en/magazine/the-handshake-that-started-it-all' },
          { texto: 'Nike: Bill Bowerman, Nike’s Original Innovator', href: 'https://about.nike.com/en/magazine/bill-bowerman-nike-s-original-innovator' },
          { texto: 'Stanford GSB: Phil Knight on the Controversial Kaepernick Ad and Nike’s Never-Give-Up Attitude (2019)', href: 'https://www.gsb.stanford.edu/index%2ephp/node/474621' },
        ],
      },
      en: {
        combinacion: 'Sales + Product',
        frase: { inicio: 'A runner and his coach sealed with a handshake', resaltado: 'a shoe business', fin: '.' },
        aportes: ['Importing and sales', 'Footwear design'],
        parrafos: [
          'Phil Knight ran on the University of Oregon track team, coached by Bill Bowerman, who was a mentor, coach and friend to him.',
          'On January 25, 1964, they had lunch at a Portland hotel to discuss a possible partnership and shook hands across the table. Blue Ribbon Sports, the precursor to Nike, was born.',
          'Knight took charge of importing Japanese shoes and selling them, at first from his car; Bowerman, of improving the footwear: his innovations came to comprise eight patents.',
        ],
        fuentes: [
          { texto: 'Nike: The Handshake That Started It All', href: 'https://about.nike.com/en/magazine/the-handshake-that-started-it-all' },
          { texto: 'Nike: Bill Bowerman, Nike’s Original Innovator', href: 'https://about.nike.com/en/magazine/bill-bowerman-nike-s-original-innovator' },
          { texto: 'Stanford GSB: Phil Knight on the Controversial Kaepernick Ad and Nike’s Never-Give-Up Attitude (2019)', href: 'https://www.gsb.stanford.edu/index%2ephp/node/474621' },
        ],
      },
      pt: {
        combinacion: 'Vendas + Produto',
        frase: { inicio: 'Um corredor e seu treinador selaram com um aperto de mão', resaltado: 'um negócio de tênis', fin: '.' },
        aportes: ['Importação e vendas', 'Design do calçado'],
        parrafos: [
          'Phil Knight corria na equipe de atletismo da Universidade de Oregon, treinado por Bill Bowerman, que foi para ele mentor, treinador e amigo.',
          'Em 25 de janeiro de 1964 almoçaram em um hotel de Portland para falar de uma possível sociedade e apertaram as mãos sobre a mesa. Nascia a Blue Ribbon Sports, antecessora da Nike.',
          'Knight cuidou de importar tênis japoneses e vendê-los, no começo do porta-malas do carro; Bowerman, de melhorar o calçado: suas inovações chegaram a somar oito patentes.',
        ],
        fuentes: [
          { texto: 'Nike: The Handshake That Started It All', href: 'https://about.nike.com/en/magazine/the-handshake-that-started-it-all' },
          { texto: 'Nike: Bill Bowerman, Nike’s Original Innovator', href: 'https://about.nike.com/en/magazine/bill-bowerman-nike-s-original-innovator' },
          { texto: 'Stanford GSB: Phil Knight on the Controversial Kaepernick Ad and Nike’s Never-Give-Up Attitude (2019)', href: 'https://www.gsb.stanford.edu/index%2ephp/node/474621' },
        ],
      },
    },
  },
  {
    clave: 'mercadolibre',
    nombre: 'Mercado Libre',
    anio: 1999,
    areaFondo: 'marketing',
    personas: [
      { iniciales: 'MG', nombre: 'Marcos Galperin', area: 'marketing', foto: '/founders-legends/mercado_libre/marcos_galperin.jpg' },
      { iniciales: 'HK', nombre: 'Hernán Kazah', area: 'operaciones', foto: '/founders-legends/mercado_libre/hernan_kazah.jfif' },
      { iniciales: 'ST', nombre: 'Stelleo Tolda', area: 'operaciones', foto: '/founders-legends/mercado_libre/stelleo_tolda.jpeg' },
    ],
    textos: {
      es: {
        combinacion: 'Negocio + Operaciones',
        frase: { inicio: 'Galperin escribió un plan de negocio durante su MBA. Pronto convenció a un compañero,', resaltado: 'Hernán Kazah', fin: ', de unirse.' },
        aportes: ['Plan de negocio y dirección', 'Operaciones', 'Operaciones en Brasil'],
        parrafos: [
          'Marcos Galperin, Hernán Kazah y Stelleo Tolda se conocieron como compañeros del MBA de Stanford, promoción de 1999.',
          'En marzo de 1999, mientras estudiaba el MBA, Galperin escribió el plan de negocio de Mercado Libre y empezó a reunir un equipo. Pronto convenció a Kazah de sumarse.',
          'La empresa empezó a operar en Argentina en agosto de 1999, como un mercado en línea para comercio electrónico y subastas. Galperin fue su director ejecutivo, Kazah, su director de operaciones y Tolda, gerente de país de Brasil.',
        ],
        fuentes: [
          { texto: 'Stanford GSB: Mercado Libre Founders', href: 'https://www.gsb.stanford.edu/insights/mercado-libre-founders-it-takes-patience-resilience' },
          { texto: 'MercadoLibre, formulario S-1/A ante la SEC (2007)', href: 'https://www.sec.gov/Archives/edgar/data/0001099590/000119312507154595/ds1a.htm' },
        ],
      },
      en: {
        combinacion: 'Business + Operations',
        frase: { inicio: 'Galperin wrote a business plan during his MBA. Soon he convinced a classmate,', resaltado: 'Hernán Kazah', fin: ', to join.' },
        aportes: ['Business plan and leadership', 'Operations', 'Operations in Brazil'],
        parrafos: [
          'Marcos Galperin, Hernán Kazah and Stelleo Tolda met as classmates in Stanford’s MBA class of 1999.',
          'In March 1999, while studying for his MBA, Galperin wrote the business plan for Mercado Libre and began to assemble a team. He soon convinced Kazah to join.',
          'The company began operating in Argentina in August 1999, as an online marketplace for e-commerce and auctions. Galperin was its chief executive officer, Kazah its chief operating officer and Tolda its country manager for Brazil.',
        ],
        fuentes: [
          { texto: 'Stanford GSB: Mercado Libre Founders', href: 'https://www.gsb.stanford.edu/insights/mercado-libre-founders-it-takes-patience-resilience' },
          { texto: 'MercadoLibre, Form S-1/A filed with the SEC (2007)', href: 'https://www.sec.gov/Archives/edgar/data/0001099590/000119312507154595/ds1a.htm' },
        ],
      },
      pt: {
        combinacion: 'Negócio + Operações',
        frase: { inicio: 'Galperin escreveu um plano de negócios durante o MBA. Logo convenceu um colega,', resaltado: 'Hernán Kazah', fin: ', a se juntar.' },
        aportes: ['Plano de negócios e liderança', 'Operações', 'Operações no Brasil'],
        parrafos: [
          'Marcos Galperin, Hernán Kazah e Stelleo Tolda se conheceram como colegas de turma no MBA de Stanford, turma de 1999.',
          'Em março de 1999, enquanto cursava o MBA, Galperin escreveu o plano de negócios do Mercado Libre e começou a montar uma equipe. Logo convenceu Kazah a se juntar.',
          'A empresa começou a operar na Argentina em agosto de 1999, como um mercado on-line de comércio eletrônico e leilões. Galperin foi seu diretor executivo, Kazah, seu diretor de operações e Tolda, gerente do país para o Brasil.',
        ],
        fuentes: [
          { texto: 'Stanford GSB: Mercado Libre Founders', href: 'https://www.gsb.stanford.edu/insights/mercado-libre-founders-it-takes-patience-resilience' },
          { texto: 'MercadoLibre, formulário S-1/A entregue à SEC (2007)', href: 'https://www.sec.gov/Archives/edgar/data/0001099590/000119312507154595/ds1a.htm' },
        ],
      },
    },
  },
  {
    clave: 'rappi',
    nombre: 'Rappi',
    anio: 2015,
    areaFondo: 'operaciones',
    personas: [
      { iniciales: 'SB', nombre: 'Simón Borrero', area: 'tecnologia', foto: '/founders-legends/rappi/simon_borrero.jfif' },
      { iniciales: 'SM', nombre: 'Sebastián Mejía', area: 'marketing', foto: '/founders-legends/rappi/sebastian_mejia.jpg' },
      { iniciales: 'FV', nombre: 'Felipe Villamarín', area: 'finanzas', foto: '/founders-legends/rappi/felipe_villamarin.jpg' },
    ],
    textos: {
      es: {
        combinacion: 'Software + Logística',
        frase: { inicio: 'Tres socios que ya hacían software de compras en línea lo unieron a', resaltado: 'una logística de reparto colaborativa', fin: '.' },
        aportes: ['Empresa de software (Imaginamos)', 'Negocios', 'Economía'],
        parrafos: [
          'Simón Borrero, Sebastián Mejía y Felipe Villamarín trabajaban juntos en software que cambiaba la forma de comprar el supermercado en línea. Borrero había creado Imaginamos, una empresa que desarrolla software, y pusieron su propio dinero, ganado licenciando software de compras en línea a grandes minoristas.',
          'Según contó Borrero en 2016, en 2015 todavía eran un equipo pequeño que repartía donas en la calle a cambio de descargas de la aplicación.',
          'Rappi empezó como una aplicación para pedir a domicilio productos de una tienda de barrio, en unas pocas cuadras de Bogotá. Su idea fue combinar el software de compras con una logística de última milla hecha por repartidores colaborativos.',
        ],
        fuentes: [
          { texto: 'Semana: Rappi, una idea millonaria que vino de los usuarios (2018)', href: 'https://www.semana.com/economia/articulo/rappi-el-secreto-del-exito/583525' },
          { texto: 'Y Combinator: Q&A with the cofounders of Rappi (2018)', href: 'https://www.ycombinator.com/blog/qa-with-felipe-villamarin-simon-borrero-and-sebastian-mejia-cofounders-of-rappi' },
          { texto: 'LAVCA: Entrepreneur Profile, Simón Borrero (2016)', href: 'https://www.lavca.org/feature/entrepreneur-profile-simon-borrero-co-founder-ceo-rappi/' },
        ],
      },
      en: {
        combinacion: 'Software + Logistics',
        frase: { inicio: 'Three partners who already built online shopping software combined it with', resaltado: 'crowdsourced delivery logistics', fin: '.' },
        aportes: ['Software company (Imaginamos)', 'Business', 'Economics'],
        parrafos: [
          'Simón Borrero, Sebastián Mejía and Felipe Villamarín worked together on software that transformed the way people buy groceries online. Borrero had created Imaginamos, a company that develops software, and they put in their own money, earned from licensing online shopping software to big retailers.',
          'As Borrero told it in 2016, in 2015 they were still a small team giving away donuts in the street in exchange for app downloads.',
          'Rappi began as an app for ordering products from a neighborhood shop for delivery, within a few blocks of Bogotá. The idea was to combine the shopping software with crowdsourced last-mile logistics.',
        ],
        fuentes: [
          { texto: 'Semana: Rappi, una idea millonaria que vino de los usuarios (2018)', href: 'https://www.semana.com/economia/articulo/rappi-el-secreto-del-exito/583525' },
          { texto: 'Y Combinator: Q&A with the cofounders of Rappi (2018)', href: 'https://www.ycombinator.com/blog/qa-with-felipe-villamarin-simon-borrero-and-sebastian-mejia-cofounders-of-rappi' },
          { texto: 'LAVCA: Entrepreneur Profile, Simón Borrero (2016)', href: 'https://www.lavca.org/feature/entrepreneur-profile-simon-borrero-co-founder-ceo-rappi/' },
        ],
      },
      pt: {
        combinacion: 'Software + Logística',
        frase: { inicio: 'Três sócios que já faziam software de compras on-line o uniram a', resaltado: 'uma logística de entrega colaborativa', fin: '.' },
        aportes: ['Empresa de software (Imaginamos)', 'Negócios', 'Economia'],
        parrafos: [
          'Simón Borrero, Sebastián Mejía e Felipe Villamarín trabalhavam juntos em um software que mudava a forma de fazer compras de supermercado on-line. Borrero havia criado a Imaginamos, uma empresa que desenvolve software, e colocaram dinheiro próprio, ganho licenciando software de compras on-line para grandes varejistas.',
          'Segundo contou Borrero em 2016, em 2015 ainda eram uma equipe pequena distribuindo donuts na rua em troca de downloads do aplicativo.',
          'A Rappi começou como um aplicativo para pedir em casa produtos de uma loja de bairro, em poucos quarteirões de Bogotá. A ideia era combinar o software de compras com uma logística de última milha feita por entregadores colaborativos.',
        ],
        fuentes: [
          { texto: 'Semana: Rappi, una idea millonaria que vino de los usuarios (2018)', href: 'https://www.semana.com/economia/articulo/rappi-el-secreto-del-exito/583525' },
          { texto: 'Y Combinator: Q&A with the cofounders of Rappi (2018)', href: 'https://www.ycombinator.com/blog/qa-with-felipe-villamarin-simon-borrero-and-sebastian-mejia-cofounders-of-rappi' },
          { texto: 'LAVCA: Entrepreneur Profile, Simón Borrero (2016)', href: 'https://www.lavca.org/feature/entrepreneur-profile-simon-borrero-co-founder-ceo-rappi/' },
        ],
      },
    },
  },

]

export function historiasDeEjemplo(idioma: string): Historia[] {
  return base.map(({ textos, personas, ...fijo }) => {
    const propios = idioma === 'en' || idioma === 'pt' ? textos[idioma] : undefined
    const { aportes, ...resto } = propios ?? textos.es
    return { ...fijo, ...resto, personas: personas.map((persona, lugar) => ({ ...persona, aporte: aportes[lugar] ?? '' })) }
  })
}
