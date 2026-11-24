import type { Historia, PersonaHistoria } from '../../domain/Historia'

// inventado / por verificar: historias de ejemplo para armar la sección. Los datos de cada una (cómo se conocieron, el año, qué
// hizo cada persona) y las fuentes son una propuesta: hay que comprobar en la fuente que respalda cada dato antes de publicar.
// Las traducciones a en y pt son propuestas. Mercado Libre y Rappi están por escribir: no tienen texto ni fuente y por eso la
// regla del dominio no las deja salir.

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
    areaFondo: 'finanzas',
    personas: [
      { iniciales: 'MG', nombre: 'Marcos Galperin', area: 'marketing' },
      { iniciales: 'HK', nombre: 'Hernán Kazah', area: 'finanzas' },
    ],
    textos: {
      es: {
        combinacion: 'Por escribir',
        frase: { inicio: 'Historia', resaltado: 'por escribir', fin: '.' },
        aportes: ['Por verificar', 'Por verificar'],
        parrafos: [],
        fuentes: [],
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
