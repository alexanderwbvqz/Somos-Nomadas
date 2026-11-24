import type { Aliado } from '../../domain/Aliado'
import type { AliadoRepository } from '../../domain/AliadoRepository'

// inventado: 12 aliados de ejemplo hasta tener los reales o el backend.
// Los nombres, textos, cifras, enlaces y números son ficticios (no corresponden a ninguna marca ni persona real;
// los enlaces usan el dominio reservado ".example" y los números no son de nadie).
// Seis tienen el detalle completo (con distintas combinaciones de contacto) y seis solo lo mínimo, para comprobar
// que la página muestra solo los datos que existen. Van intercalados por tipo, como se verían en el listado.
const sinDetalle = (): Pick<Aliado, 'descripcionLarga' | 'datosClave' | 'areas' | 'apoyos' | 'redes'> => ({
  descripcionLarga: [],
  datosClave: [],
  areas: [],
  apoyos: [],
  redes: [],
})

const ALIADOS: Aliado[] = [
  {
    id: 'mentoria-producto',
    nombre: 'Mentoría en producto',
    tipo: 'mentores',
    descripcion: 'Acompaña a equipos técnicos a convertir una idea en un producto que la gente use: qué construir primero, cómo hablar con los primeros usuarios y cómo saber si funciona.',
    descripcionLarga: [
      'Mentoría en producto reúne a un grupo de profesionales con años de experiencia construyendo productos digitales en empresas de distintos tamaños. Su trabajo es ayudar a equipos que empiezan a decidir qué construir, en qué orden y para quién.',
      'En la comunidad de Nómadas trabajan sobre todo con equipos fundadores en los que hay perfiles técnicos y falta una mirada de producto: ordenan las ideas, definen un primer prototipo y diseñan cómo probarlo con usuarios reales antes de invertir meses de desarrollo.',
    ],
    datosClave: [
      { valor: '12 años', etiqueta: 'de experiencia en producto' },
      { valor: 'Fintech, salud', etiqueta: 'sectores en los que trabajó' },
      { valor: 'Español e inglés', etiqueta: 'idiomas' },
      { valor: '4 h al mes', etiqueta: 'de disponibilidad para la comunidad' },
    ],
    areas: ['Producto', 'Prototipos', 'Entrevistas con usuarios', 'Priorización'],
    paraQuien: 'Equipos que ya tienen perfiles técnicos y están definiendo su primer producto, antes de lanzar o en las primeras semanas con usuarios.',
    apoyos: [
      'Sesiones de mentoría uno a uno para equipos de la comunidad.',
      'Revisión de prototipos y de la lista de prioridades del producto.',
      'Guía para hablar con los primeros usuarios y aprender de cada conversación.',
      'Sesiones abiertas en los eventos de Nómadas.',
    ],
    ciudad: 'Lima, Perú',
    sitioWeb: 'https://mentoriaenproducto.example',
    redes: [
      { tipo: 'linkedin', href: 'https://www.linkedin.com/' },
      { tipo: 'instagram', href: 'https://www.instagram.com/' },
    ],
    enLaRedDesde: '2026-03-01',
    whatsapp: '51000000001',
    enlaceAgenda: 'https://agenda.example/mentoria-producto',
  },
  {
    id: 'cowork-plaza',
    nombre: 'Cowork Plaza',
    tipo: 'organizadores',
    descripcion: 'Espacio de trabajo y eventos en el centro de la ciudad. Recibe cada semana a los nómadas para trabajar juntos, conocerse y probar ideas en un ambiente tranquilo.',
    descripcionLarga: [
      'Cowork Plaza es un espacio de trabajo compartido en el centro de Lima, pensado para equipos que empiezan. Tiene escritorios abiertos, salas pequeñas para reuniones y una sala grande que se usa para talleres y encuentros.',
      'Con Nómadas organiza noches de networking y deja una parte del espacio disponible para los equipos de la comunidad, de modo que quienes se conocen en un evento tengan dónde seguir trabajando juntos.',
    ],
    datosClave: [
      { valor: '60 personas', etiqueta: 'de capacidad en la sala de eventos' },
      { valor: 'Wifi, sala, cocina', etiqueta: 'servicios' },
      { valor: 'L a V, 8 a 20 h', etiqueta: 'horario' },
      { valor: 'Centro de Lima', etiqueta: 'ubicación' },
    ],
    areas: ['Espacio de trabajo', 'Eventos', 'Comunidad'],
    paraQuien: 'Equipos que quieren un lugar donde reunirse y trabajar juntos, sobre todo en las primeras etapas.',
    apoyos: [
      'Sala para los eventos presenciales de la comunidad.',
      'Escritorios para equipos de Nómadas dos días por semana.',
      'Apoyo logístico durante los encuentros.',
    ],
    ciudad: 'Lima, Perú',
    sitioWeb: 'https://coworkplaza.example',
    redes: [
      { tipo: 'instagram', href: 'https://www.instagram.com/' },
      { tipo: 'linkedin', href: 'https://www.linkedin.com/' },
    ],
    enLaRedDesde: '2026-02-01',
    whatsapp: '51000000002',
    enlaceAgenda: 'https://agenda.example/cowork-plaza',
  },
  {
    id: 'fondo-semilla-sur',
    nombre: 'Fondo Semilla Sur',
    tipo: 'estrategicos',
    descripcion: 'Capital inicial y acompañamiento para proyectos de la comunidad con equipo completo. Evalúa equipos que combinan perfiles técnicos y de negocio y los conecta con otros inversionistas.',
    descripcionLarga: [
      'Fondo Semilla Sur invierte en las primeras etapas de empresas tecnológicas de la región. Prefiere equipos completos, con perfiles técnicos y de negocio, que ya tengan un primer producto o primeros clientes.',
      'Además del capital, acompaña a los equipos en la preparación de su ronda y los presenta a otros fondos cuando es el momento. Participa en los eventos de Nómadas para conocer a los equipos antes de que busquen financiamiento.',
    ],
    datosClave: [
      { valor: 'Hasta 150 mil', etiqueta: 'dólares por proyecto' },
      { valor: 'Preinversión', etiqueta: 'etapa en la que invierte' },
      { valor: '2 meses', etiqueta: 'tiempo de decisión' },
      { valor: 'Tecnología y servicios', etiqueta: 'sectores' },
    ],
    areas: ['Capital semilla', 'Acompañamiento', 'Red de inversionistas'],
    paraQuien: 'Equipos que cuentan con un equipo completo y un primer producto o clientes, y buscan su primera ronda.',
    apoyos: [
      'Inversión inicial para proyectos de la comunidad seleccionados.',
      'Preparación de la ronda: números, presentación y preguntas frecuentes de los inversionistas.',
      'Presentación a otros fondos cuando el equipo está listo.',
    ],
    ciudad: 'Santiago, Chile',
    sitioWeb: 'https://fondosemillasur.example',
    redes: [{ tipo: 'linkedin', href: 'https://www.linkedin.com/' }],
    enLaRedDesde: '2026-04-01',
    enlaceAgenda: 'https://agenda.example/fondo-semilla-sur',
  },
  {
    id: 'mentoria-ventas',
    nombre: 'Mentoría en ventas',
    tipo: 'mentores',
    descripcion: 'Ayuda a conseguir los primeros clientes y a validar la oferta con ventas reales: cómo hablar con compradores, cómo cerrar una venta y cómo medir lo que funciona.',
    descripcionLarga: [
      'Mentoría en ventas está formada por personas que han dirigido equipos comerciales en empresas de software y servicios. Se enfocan en la etapa en la que un producto existe pero todavía no tiene clientes que paguen.',
      'Trabajan con los equipos de la comunidad en cómo explicar el valor del producto, a quién ofrecerlo primero y cómo cerrar los primeros acuerdos, y les enseñan a registrar lo que aprenden de cada conversación.',
    ],
    datosClave: [
      { valor: '10 años', etiqueta: 'de experiencia en ventas' },
      { valor: 'B2B, SaaS', etiqueta: 'sectores' },
      { valor: 'Español', etiqueta: 'idiomas' },
      { valor: '3 h al mes', etiqueta: 'de disponibilidad para la comunidad' },
    ],
    areas: ['Ventas B2B', 'Primeros clientes', 'Propuesta de valor'],
    paraQuien: 'Equipos que ya tienen un producto y necesitan sus primeros clientes o validar su precio.',
    apoyos: [
      'Revisión del discurso de ventas y de la propuesta de valor.',
      'Simulación de conversaciones con compradores.',
      'Seguimiento de las primeras ventas del equipo.',
    ],
    ciudad: 'Bogotá, Colombia',
    redes: [{ tipo: 'linkedin', href: 'https://www.linkedin.com/' }],
    enLaRedDesde: '2026-05-01',
    enlaceAgenda: 'https://agenda.example/mentoria-ventas',
  },
  {
    id: 'comunidad-brujula',
    nombre: 'Comunidad Brújula',
    tipo: 'organizadores',
    descripcion: 'Red de emprendedores que organiza encuentros y talleres en varias ciudades. Reúne a fundadores en etapas tempranas para compartir lo que aprenden y apoyarse entre ellos.',
    descripcionLarga: [
      'Comunidad Brújula es una red de emprendedores que se reúne cada mes, en persona y en línea, para compartir lo que está aprendiendo cada quien. Empezó en una ciudad y hoy tiene capítulos en cinco.',
      'Con Nómadas comparte los eventos y las listas de personas, para que quienes buscan equipo encuentren a otros fundadores en etapas parecidas a la suya.',
    ],
    datosClave: [
      { valor: '5 ciudades', etiqueta: 'con encuentros' },
      { valor: '400 miembros', etiqueta: 'en la red' },
      { valor: 'Mensual', etiqueta: 'frecuencia de los encuentros' },
      { valor: 'Presencial y en línea', etiqueta: 'formato' },
    ],
    areas: ['Encuentros', 'Talleres', 'Red de contactos'],
    redes: [{ tipo: 'instagram', href: 'https://www.instagram.com/' }],
    enLaRedDesde: '2026-03-01',
    whatsapp: '51000000003',
    apoyos: ['Encuentros mensuales abiertos a la comunidad de Nómadas.', 'Talleres sobre temas que piden los propios fundadores.'],
  },
  {
    id: 'universidad-horizonte',
    nombre: 'Universidad Horizonte',
    tipo: 'estrategicos',
    descripcion: 'Conecta a estudiantes y egresados con equipos fundadores de la comunidad. Ofrece espacios del campus para eventos y ayuda a que más perfiles técnicos y de negocio se encuentren.',
    ...sinDetalle(),
  },
  {
    id: 'mentoria-financiera',
    nombre: 'Mentoría financiera',
    tipo: 'mentores',
    descripcion: 'Modelos financieros, métricas y flujo de caja para proyectos que empiezan. Ayuda a entender cuánto cuesta lanzar, cuándo se acaba el dinero y qué números mirar cada mes.',
    ...sinDetalle(),
  },
  {
    id: 'casa-emprende',
    nombre: 'Casa Emprende',
    tipo: 'organizadores',
    descripcion: 'Sede para eventos presenciales y encuentros de networking con aliados. Cuenta con una sala para dinámicas en grupo y espacio para que los equipos trabajen después del evento.',
    ...sinDetalle(),
  },
  {
    id: 'aceleradora-cumbre',
    nombre: 'Aceleradora Cumbre',
    tipo: 'estrategicos',
    descripcion: 'Programa de aceleración al que pueden postular los equipos de la comunidad. Combina mentoría, un grupo de pares y una presentación final ante posibles inversionistas.',
    descripcionLarga: [
      'Aceleradora Cumbre es un programa de doce semanas para equipos que ya tienen un producto y quieren crecer. Cada convocatoria elige a un grupo pequeño de equipos y los acompaña con mentoría semanal y sesiones de trabajo entre pares.',
      'El programa termina con una presentación ante inversionistas y aliados. Los equipos de la comunidad de Nómadas pueden postular a cada convocatoria.',
    ],
    datosClave: [
      { valor: '12 semanas', etiqueta: 'de duración' },
      { valor: '10 equipos', etiqueta: 'por convocatoria' },
      { valor: 'Dos al año', etiqueta: 'convocatorias' },
      { valor: 'Sin costo', etiqueta: 'para los equipos seleccionados' },
    ],
    areas: ['Aceleración', 'Mentoría', 'Presentación a inversionistas'],
    paraQuien: 'Equipos que ya tienen un producto y quieren crecer con ayuda de mentores y de otros equipos.',
    apoyos: [
      'Mentoría semanal durante las doce semanas.',
      'Un grupo de equipos en la misma etapa para aprender entre pares.',
      'Presentación final ante inversionistas y aliados.',
    ],
    ciudad: 'Ciudad de México, México',
    sitioWeb: 'https://aceleradoracumbre.example',
    redes: [
      { tipo: 'linkedin', href: 'https://www.linkedin.com/' },
      { tipo: 'instagram', href: 'https://www.instagram.com/' },
    ],
    enLaRedDesde: '2026-06-01',
    whatsapp: '51000000004',
    enlaceAgenda: 'https://agenda.example/aceleradora-cumbre',
  },
  {
    id: 'mentoria-operaciones',
    nombre: 'Mentoría en operaciones',
    tipo: 'mentores',
    descripcion: 'Procesos y logística para que la empresa crezca con orden. Ayuda a documentar cómo se hace cada cosa, a elegir proveedores y a prepararse para cumplir con la normativa.',
    ...sinDetalle(),
  },
  {
    id: 'red-joven-emprende',
    nombre: 'Red Joven Emprende',
    tipo: 'organizadores',
    descripcion: 'Comunidad universitaria que lleva los eventos de Nómadas a nuevas ciudades. Organiza encuentros entre estudiantes con ideas y ayuda a que lleguen a la comunidad.',
    ...sinDetalle(),
  },
  {
    id: 'estudio-legal-aliado',
    nombre: 'Estudio Legal Aliado',
    tipo: 'estrategicos',
    descripcion: 'Asesoría legal básica para constituir la empresa y ordenar los acuerdos entre socios. Explica qué debe quedar por escrito antes de empezar y cómo repartir la propiedad.',
    ...sinDetalle(),
  },
]

export class MockAliadoRepository implements AliadoRepository {
  async listarAliados(): Promise<Aliado[]> {
    return ALIADOS
  }
}
