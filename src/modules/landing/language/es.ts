import type { TextosLanding } from './tipos'

export const es: TextosLanding = {
  cabecera: {
    logoAlt: 'Nómadas',
    navegacionPrincipal: 'Navegación principal',
    postular: 'Postular',
  },
  pie: {
    descripcion: 'Comunidad abierta que conecta emprendedores con talento complementario para fundar empresas.',
    registrados: 'personas registradas',
    explorar: { titulo: 'Explorar', directorio: 'Directorio', match: 'Conexiones match', eventos: 'Eventos presenciales' },
    ecosistema: { titulo: 'Ecosistema', red: 'Red de aliados', mentores: 'Mentores', postular: 'Postular como aliado' },
    privacidad: { titulo: 'Privacidad', politica: 'Política de datos', terminos: 'Términos de convivencia' },
    avisoAntes: 'Usamos tus datos personales solo para conectar fundadores entre sí. Más información en la',
    avisoEnlace: 'política de datos',
    avisoDespues: '.',
    copyright: '© {anio} Nómadas. Todos los derechos reservados.',
    idioma: 'Idioma',
  },
  hero: {
    tituloInicio: 'Los grandes proyectos nacen cuando encuentran a las',
    tituloResaltado: 'personas correctas.',
    parrafo:
      'Nómadas es una comunidad gratuita de emprendedores que buscan cofundadores. Reunimos perfiles de Tecnología, Marketing & Ventas, Operaciones y Finanzas, y usamos inteligencia artificial para sugerirte a quienes mejor complementan tu idea. Después nos vemos en persona, en eventos con dinámicas que ayudan a conocerse y a descubrir quién lidera.',
    botonPrincipal: 'Encuentra a tu equipo',
    enlaceSecundario: 'Explorar directorio',
    etiquetaAliados: 'Empresas que nos apoyan',
    ventajas: ['100 % gratis', 'Match con IA', 'Eventos presenciales'],
  },
  problemas: {
    tituloInicio: 'Las ideas están en todas partes.',
    tituloFin: 'Los equipos que las construyen, no.',
    subtitulo:
      'Muchos emprendedores tienen una idea, pero no un equipo. En Nómadas reemplazamos el azar de los eventos y las charlas de café por conexiones basadas en compatibilidad real: perfiles que se complementan, tiempo de dedicación y valores compartidos.',
    etiquetaProblema: 'El problema común',
    etiquetaSolucion: 'La solución Nómadas',
    diagrama: {
      descripcion: 'Las cuatro áreas se superponen para formar un equipo completo',
      pie: 'Cuatro áreas, un equipo completo.',
      tecnologia: 'Tecnología',
      marketing: 'Marketing & Ventas',
      operaciones: 'Operaciones',
      finanzas: 'Finanzas',
      equipo: 'Equipo',
      roles: {
        tecnologia: 'construye el producto',
        marketing: 'lo hace llegar a los clientes',
        operaciones: 'hace que todo funcione',
        finanzas: 'cuida el dinero',
      },
    },
    items: {
      networking: {
        tema: 'Networking',
        titulo: 'El networking al azar',
        problema:
          'Conocer gente en eventos masivos deja cientos de contactos y ninguna conversación profunda sobre visión o dedicación.',
        solucion: 'Te sugerimos hasta 10 conexiones por afinidad, cada una con una pregunta para romper el hielo.',
      },
      perfiles: {
        tema: 'Perfiles',
        titulo: 'Equipos repetidos o desbalanceados',
        problema: 'Dos perfiles técnicos sin quien venda, o dos vendedores sin quien construya.',
        solucion: 'Clasificamos a cada persona en una de cuatro áreas para que los equipos se complementen.',
      },
      equipo: {
        tema: 'Equipo',
        titulo: 'No saber cómo reacciona tu socio',
        problema:
          'Empezar con alguien sin ver cómo decide bajo presión, ante un desacuerdo o en una crisis de caja.',
        solucion: 'En nuestros encuentros presenciales ves cómo piensa cada persona antes de comprometerte.',
      },
      respaldo: {
        tema: 'Respaldo',
        titulo: 'Empezar sin respaldo',
        problema: 'Los fundadores nuevos pierden meses buscando asesores, herramientas y espacios de trabajo.',
        solucion: 'Una red de mentores, organizadores y aliados acompaña a los equipos.',
      },
    },
  },
  match: {
    etiqueta: 'Motor de match',
    tituloInicio: 'Pensado para formar equipos,',
    tituloResaltado: 'no para sumar contactos.',
    parrafo:
      'Comparamos lo que cada persona cuenta de sí misma, no solo sus etiquetas: el sistema entiende cuándo dos descripciones se parecen en sentido, aunque usen palabras distintas. El resultado son hasta 10 conexiones ordenadas por afinidad.',
    puntos: [
      'Solo te sugerimos a quienes confirmaron asistencia al evento, para que las conexiones sean con personas presentes.',
      'Cada conexión llega con una pregunta pensada para esa persona, para romper el hielo.',
    ],
    panel: {
      titulo: 'Así se arma tu lista',
      insignia: 'Hasta {total} conexiones',
      etiquetaSelector: 'Elige tu área',
      etiquetaPropia: 'tu área',
      etiquetaCantidad: 'hasta {cantidad}',
      etiquetaConexion: 'Una conexión · {area}',
      afinidad: 'Afinidad alta',
      pregunta: '«¿Qué problema del mundo resolverías si tuvieras un millón de dólares?»',
      notaEjemplo: 'Ejemplo ilustrativo para una persona del área de {area}.',
    },
  },
  pilares: {
    etiqueta: 'Los 4 pilares',
    tituloInicio: 'Todo equipo necesita las cuatro,',
    tituloResaltado: 'y hoy buscamos más de dos.',
    parrafo:
      'Un equipo fundador completo combina estas cuatro disciplinas. Hoy la comunidad tiene muchos perfiles de Tecnología y de Marketing & Ventas, y buscamos más de Operaciones y Finanzas.',
    estado: 'Postulaciones abiertas',
    botonPostular: 'Postular',
    enlacePerfiles: 'Ver perfiles',
    areas: {
      tecnologia: {
        descripcion:
          'Desarrolladores, especialistas en datos e IA y líderes de producto que convierten una idea en un producto funcional.',
        claves: ['Desarrollo', 'Datos e IA', 'Producto'],
      },
      marketing: {
        descripcion:
          'Crecimiento, ventas B2B y marketing de producto para conseguir los primeros clientes y validar la oferta.',
        claves: ['Crecimiento', 'Ventas B2B', 'Marca'],
      },
      operaciones: {
        descripcion: 'Logística, procesos, cumplimiento normativo y soporte para que la empresa crezca con orden.',
        claves: ['Procesos', 'Logística', 'Legal'],
      },
      finanzas: {
        descripcion:
          'Modelos financieros, rondas de inversión, métricas y flujo de caja para que el proyecto sea sostenible.',
        claves: ['Modelado', 'Inversión', 'Flujo de caja'],
      },
    },
  },
  aliados: {
    etiqueta: 'Aliados',
    tituloInicio: 'Ningún equipo crece solo.',
    tituloResaltado: 'Los respalda una red.',
    parrafo:
      'Mentores, organizadores y aliados estratégicos acompañan a los fundadores con experiencia, espacios y capital. Cualquier persona u organización puede postular para sumarse.',
    botonAliado: 'Quiero ser aliado',
    enlaceRed: 'Ver la red de aliados',
    nota: 'Revisamos cada postulación antes de publicarla, para cuidar la calidad de la red.',
    etiquetaActivos: 'Aliados activos',
    activoUno: '{cantidad} activo',
    activoOtros: '{cantidad} activos',
    tipos: {
      mentores: {
        nombre: 'Mentores',
        descripcion: 'Aportan su experiencia y acompañan a los fundadores en sus primeros pasos.',
        enlace: 'Ver mentores',
      },
      organizadores: {
        nombre: 'Organizadores',
        descripcion: 'Ponen los espacios, los eventos y las comunidades donde se reúnen los nómadas.',
        enlace: 'Ver organizadores',
      },
      estrategicos: {
        nombre: 'Aliados estratégicos',
        descripcion: 'Empresas, universidades y capital que potencian a los proyectos.',
        enlace: 'Ver aliados',
      },
    },
  },
  cifras: {
    titulo: 'Por qué importa el equipo',
    parrafo:
      'Los datos apuntan en la misma dirección: los equipos completos llegan más lejos. Estas son algunas de las cifras que nos hacen apostar por conectar a las personas correctas.',
    etiquetaLista: 'Cifras sobre equipos y startups',
    items: {
      capitalRiesgo: 'de las startups con capital de riesgo no devuelve el dinero a sus inversores',
      fundadoresSolos: 'de las startups que levantan capital tienen un solo fundador, frente al {comparado} % de las nuevas',
      equipoInadecuado: 'fracasan por no tener el equipo adecuado',
      capitalEquipoCompleto: 'más capital con equipos técnicos y de negocio',
      capitalMentores: 'más capital con mentores y seguimiento de métricas',
      registrados: 'personas registradas en la comunidad',
    },
  },
}
