import type { Historia, PersonaHistoria } from '../../domain/Historia'

// inventado / por verificar: historias de ejemplo para armar la sección. Los datos de cada una (cómo se conocieron, el año, qué
// hizo cada persona) y las fuentes son una propuesta: hay que comprobar en la fuente que respalda cada dato antes de publicar.
// Mercado Libre está redactada solo con lo que dicen sus dos fuentes (Stanford y la SEC); el área de cada persona es una decisión
// editorial, porque las fuentes dan cargos y no áreas. Las traducciones a en y pt son propuestas. Rappi está por escribir: las
// fuentes que se encontraron no dicen cómo se conocieron sus fundadores ni qué aportó cada uno, y por eso no tiene texto ni
// fuentes y la regla del dominio no la deja salir.

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
    anio: 1976,
    areaFondo: 'marketing',
    personas: [
      { iniciales: 'SJ', nombre: 'Steve Jobs', area: 'marketing' },
      { iniciales: 'SW', nombre: 'Steve Wozniak', area: 'tecnologia' },
    ],
    textos: {
      es: {
        combinacion: 'Ingeniería + Ventas',
        frase: { inicio: 'Uno construía los computadores. El otro vio cómo', resaltado: 'llevarlos a la gente', fin: '.' },
        aportes: ['Producto y ventas', 'Ingeniería'],
        parrafos: [
          'Steve Jobs y Steve Wozniak se conocieron en 1971, en California, a través de un amigo en común.',
          'Wozniak diseñaba los computadores; Jobs entendió que podían venderse. En 1976 fundaron Apple junto con Ronald Wayne.',
        ],
        fuentes: [{ texto: 'Wikipedia: Steve Wozniak', href: 'https://en.wikipedia.org/wiki/Steve_Wozniak' }],
      },
      en: {
        combinacion: 'Engineering + Sales',
        frase: { inicio: 'One built the computers. The other saw how to', resaltado: 'bring them to people', fin: '.' },
        aportes: ['Product and sales', 'Engineering'],
        parrafos: [
          'Steve Jobs and Steve Wozniak met in 1971, in California, through a mutual friend.',
          'Wozniak designed the computers; Jobs realised they could be sold. In 1976 they founded Apple together with Ronald Wayne.',
        ],
        fuentes: [{ texto: 'Wikipedia: Steve Wozniak', href: 'https://en.wikipedia.org/wiki/Steve_Wozniak' }],
      },
      pt: {
        combinacion: 'Engenharia + Vendas',
        frase: { inicio: 'Um construía os computadores. O outro viu como', resaltado: 'levá-los às pessoas', fin: '.' },
        aportes: ['Produto e vendas', 'Engenharia'],
        parrafos: [
          'Steve Jobs e Steve Wozniak se conheceram em 1971, na Califórnia, por meio de um amigo em comum.',
          'Wozniak projetava os computadores; Jobs percebeu que eles podiam ser vendidos. Em 1976 fundaram a Apple junto com Ronald Wayne.',
        ],
        fuentes: [{ texto: 'Wikipedia: Steve Wozniak', href: 'https://en.wikipedia.org/wiki/Steve_Wozniak' }],
      },
    },
  },
  {
    clave: 'airbnb',
    nombre: 'Airbnb',
    anio: 2008,
    areaFondo: 'tecnologia',
    personas: [
      { iniciales: 'BC', nombre: 'Brian Chesky', area: 'tecnologia' },
      { iniciales: 'JG', nombre: 'Joe Gebbia', area: 'tecnologia' },
      { iniciales: 'NB', nombre: 'Nathan Blecharczyk', area: 'tecnologia' },
    ],
    textos: {
      es: {
        combinacion: 'Diseño + Ingeniería',
        frase: { inicio: 'Brian y Joe se conocieron', resaltado: 'estudiando diseño', fin: ' en Rhode Island.' },
        aportes: ['Diseño', 'Diseño', 'Ingeniería'],
        parrafos: [
          'Brian Chesky y Joe Gebbia estudiaron diseño en la Rhode Island School of Design.',
          'Años después se sumó Nathan Blecharczyk, ingeniero, para construir la plataforma. Fundaron Airbnb en 2008.',
        ],
        fuentes: [{ texto: 'Wikipedia: Airbnb', href: 'https://en.wikipedia.org/wiki/Airbnb' }],
      },
      en: {
        combinacion: 'Design + Engineering',
        frase: { inicio: 'Brian and Joe met', resaltado: 'studying design', fin: ' in Rhode Island.' },
        aportes: ['Design', 'Design', 'Engineering'],
        parrafos: [
          'Brian Chesky and Joe Gebbia studied design at the Rhode Island School of Design.',
          'Years later Nathan Blecharczyk, an engineer, joined to build the platform. They founded Airbnb in 2008.',
        ],
        fuentes: [{ texto: 'Wikipedia: Airbnb', href: 'https://en.wikipedia.org/wiki/Airbnb' }],
      },
      pt: {
        combinacion: 'Design + Engenharia',
        frase: { inicio: 'Brian e Joe se conheceram', resaltado: 'estudando design', fin: ' em Rhode Island.' },
        aportes: ['Design', 'Design', 'Engenharia'],
        parrafos: [
          'Brian Chesky e Joe Gebbia estudaram design na Rhode Island School of Design.',
          'Anos depois, Nathan Blecharczyk, engenheiro, se juntou para construir a plataforma. Fundaram o Airbnb em 2008.',
        ],
        fuentes: [{ texto: 'Wikipedia: Airbnb', href: 'https://en.wikipedia.org/wiki/Airbnb' }],
      },
    },
  },
  {
    clave: 'nike',
    nombre: 'Nike',
    anio: 1964,
    areaFondo: 'operaciones',
    personas: [
      { iniciales: 'PK', nombre: 'Phil Knight', area: 'finanzas' },
      { iniciales: 'BB', nombre: 'Bill Bowerman', area: 'operaciones' },
    ],
    textos: {
      es: {
        combinacion: 'Finanzas + Producto',
        frase: { inicio: 'Un corredor y su entrenador empezaron', resaltado: 'vendiendo zapatillas', fin: '.' },
        aportes: ['Finanzas y ventas', 'Producto'],
        parrafos: [
          'Phil Knight corría en la Universidad de Oregon, entrenado por Bill Bowerman.',
          'En 1964 fundaron Blue Ribbon Sports: Knight llevaba las cuentas y las ventas; Bowerman diseñaba el calzado.',
        ],
        fuentes: [{ texto: 'Wikipedia: Nike, Inc.', href: 'https://en.wikipedia.org/wiki/Nike,_Inc.' }],
      },
      en: {
        combinacion: 'Finance + Product',
        frase: { inicio: 'A runner and his coach started', resaltado: 'selling shoes', fin: '.' },
        aportes: ['Finance and sales', 'Product'],
        parrafos: [
          'Phil Knight ran at the University of Oregon, coached by Bill Bowerman.',
          'In 1964 they founded Blue Ribbon Sports: Knight handled the accounts and sales; Bowerman designed the footwear.',
        ],
        fuentes: [{ texto: 'Wikipedia: Nike, Inc.', href: 'https://en.wikipedia.org/wiki/Nike,_Inc.' }],
      },
      pt: {
        combinacion: 'Finanças + Produto',
        frase: { inicio: 'Um corredor e seu treinador começaram', resaltado: 'vendendo tênis', fin: '.' },
        aportes: ['Finanças e vendas', 'Produto'],
        parrafos: [
          'Phil Knight corria na Universidade de Oregon, treinado por Bill Bowerman.',
          'Em 1964 fundaram a Blue Ribbon Sports: Knight cuidava das contas e das vendas; Bowerman projetava o calçado.',
        ],
        fuentes: [{ texto: 'Wikipedia: Nike, Inc.', href: 'https://en.wikipedia.org/wiki/Nike,_Inc.' }],
      },
    },
  },
  {
    clave: 'mercadolibre',
    nombre: 'Mercado Libre',
    anio: 1999,
    areaFondo: 'marketing',
    personas: [
      { iniciales: 'MG', nombre: 'Marcos Galperin', area: 'marketing' },
      { iniciales: 'HK', nombre: 'Hernán Kazah', area: 'operaciones' },
    ],
    textos: {
      es: {
        combinacion: 'Negocio + Operaciones',
        frase: { inicio: 'Galperin escribió un plan de negocio durante su MBA. Pronto convenció a un compañero,', resaltado: 'Hernán Kazah', fin: ', de unirse.' },
        aportes: ['Plan de negocio y dirección', 'Operaciones'],
        parrafos: [
          'Marcos Galperin y Hernán Kazah se conocieron como compañeros del MBA de Stanford, promoción de 1999.',
          'En marzo de 1999, mientras estudiaba el MBA, Galperin escribió el plan de negocio de Mercado Libre y empezó a reunir un equipo. Pronto convenció a Kazah de sumarse.',
          'La empresa empezó a operar en Argentina en agosto de 1999, como un mercado en línea para comercio electrónico y subastas. Galperin fue su director ejecutivo y Kazah, su director de operaciones.',
        ],
        fuentes: [
          { texto: 'Stanford GSB: Mercado Libre Founders', href: 'https://www.gsb.stanford.edu/insights/mercado-libre-founders-it-takes-patience-resilience' },
          { texto: 'MercadoLibre, formulario S-1/A ante la SEC (2007)', href: 'https://www.sec.gov/Archives/edgar/data/0001099590/000119312507154595/ds1a.htm' },
        ],
      },
      en: {
        combinacion: 'Business + Operations',
        frase: { inicio: 'Galperin wrote a business plan during his MBA. Soon he convinced a classmate,', resaltado: 'Hernán Kazah', fin: ', to join.' },
        aportes: ['Business plan and leadership', 'Operations'],
        parrafos: [
          'Marcos Galperin and Hernán Kazah met as classmates in Stanford’s MBA class of 1999.',
          'In March 1999, while studying for his MBA, Galperin wrote the business plan for Mercado Libre and began to assemble a team. He soon convinced Kazah to join.',
          'The company began operating in Argentina in August 1999, as an online marketplace for e-commerce and auctions. Galperin was its chief executive officer and Kazah its chief operating officer.',
        ],
        fuentes: [
          { texto: 'Stanford GSB: Mercado Libre Founders', href: 'https://www.gsb.stanford.edu/insights/mercado-libre-founders-it-takes-patience-resilience' },
          { texto: 'MercadoLibre, Form S-1/A filed with the SEC (2007)', href: 'https://www.sec.gov/Archives/edgar/data/0001099590/000119312507154595/ds1a.htm' },
        ],
      },
      pt: {
        combinacion: 'Negócio + Operações',
        frase: { inicio: 'Galperin escreveu um plano de negócios durante o MBA. Logo convenceu um colega,', resaltado: 'Hernán Kazah', fin: ', a se juntar.' },
        aportes: ['Plano de negócios e liderança', 'Operações'],
        parrafos: [
          'Marcos Galperin e Hernán Kazah se conheceram como colegas de turma no MBA de Stanford, turma de 1999.',
          'Em março de 1999, enquanto cursava o MBA, Galperin escreveu o plano de negócios do Mercado Libre e começou a montar uma equipe. Logo convenceu Kazah a se juntar.',
          'A empresa começou a operar na Argentina em agosto de 1999, como um mercado on-line de comércio eletrônico e leilões. Galperin foi seu diretor executivo e Kazah, seu diretor de operações.',
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
    areaFondo: 'tecnologia',
    personas: [
      { iniciales: 'SB', nombre: 'Simón Borrero', area: 'tecnologia' },
      { iniciales: 'SM', nombre: 'Sebastián Mejía', area: 'operaciones' },
      { iniciales: 'FV', nombre: 'Felipe Villamarín', area: 'marketing' },
    ],
    textos: {
      es: {
        combinacion: 'Por escribir',
        frase: { inicio: 'Historia', resaltado: 'por escribir', fin: '.' },
        aportes: ['Por verificar', 'Por verificar', 'Por verificar'],
        parrafos: [],
        fuentes: [],
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
