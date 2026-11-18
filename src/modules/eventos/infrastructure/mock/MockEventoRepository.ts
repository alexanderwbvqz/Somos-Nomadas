import type { Evento, ModalidadEvento } from '../../domain/Evento'
import type { EventoRepository } from '../../domain/EventoRepository'

// Zonas sin horario de verano, con su diferencia respecto a UTC en horas
const ZONAS = {
  lima: { zona: 'America/Lima', utc: -5 },
  bogota: { zona: 'America/Bogota', utc: -5 },
  guayaquil: { zona: 'America/Guayaquil', utc: -5 },
  mexico: { zona: 'America/Mexico_City', utc: -6 },
  buenosAires: { zona: 'America/Argentina/Buenos_Aires', utc: -3 },
} as const
type ClaveZona = keyof typeof ZONAS

type Ficha = {
  id: string
  nombre: string
  descripcion: string
  /** Días desde hoy */
  dias: number
  zona: ClaveZona
  lugar: string
  modalidad?: ModalidadEvento
}

// inventado: 30 eventos de ejemplo hasta tener los reales o el backend.
// Las descripciones tienen la extensión que se espera de las reales (unas 20 a 35 palabras).
// "Match and Building" es un nombre real (documento de negocio); todo lo demás, incluidas
// fechas, ciudades y descripciones, es de ejemplo. Las fechas se calculan desde hoy para
// que siempre queden en el futuro.
const FICHAS: Ficha[] = [
  { id: 'match-and-building', nombre: 'Match and Building', descripcion: 'Una noche para conocer a las personas que el match te sugiere, con dinámicas para romper el hielo y encontrar con quién construir.', dias: 24, zona: 'lima', lugar: 'Lima · por confirmar' },
  { id: 'networking-aliados', nombre: 'Noche de networking con aliados', descripcion: 'Encuentro con mentores y organizadores de la comunidad. Una noche para conocer a quienes respaldan a Nómadas y preguntarles cómo pueden ayudar a tu proyecto.', dias: 38, zona: 'lima', lugar: 'Lima' },
  { id: 'taller-cofundador', nombre: 'Taller: cómo elegir a tu cofundador', descripcion: 'Criterios y preguntas para decidir con quién fundar. Trabajamos en grupos con casos reales de decisiones entre socios y sus consecuencias.', dias: 45, zona: 'lima', lugar: 'Lima' },
  { id: 'sesion-mentores', nombre: 'Sesión abierta con mentores', descripcion: 'Preguntas en vivo a mentores de la red sobre producto, ventas y finanzas. Lleva tus dudas: no hace falta tener un proyecto avanzado.', dias: 52, zona: 'lima', lugar: 'Por videollamada', modalidad: 'enlinea' },
  { id: 'desayuno-arequipa', nombre: 'Desayuno de fundadores', descripcion: 'Un desayuno para conocer a quienes emprenden en la ciudad y encontrar a alguien con quien compartir el camino de fundar.', dias: 59, zona: 'lima', lugar: 'Arequipa' },
  { id: 'charla-primer-cliente', nombre: 'Charla: del prototipo al primer cliente', descripcion: 'Cómo pasar de la idea a la primera venta: a quién hablarle primero, qué ofrecer y cómo saber si de verdad lo quieren.', dias: 66, zona: 'bogota', lugar: 'Bogotá' },
  { id: 'taller-pitch', nombre: 'Taller de pitch en 3 minutos', descripcion: 'Practica tu presentación de tres minutos y recibe comentarios de otros fundadores y mentores en una sesión corta, práctica y pensada para perder el miedo a hablar.', dias: 73, zona: 'lima', lugar: 'Por videollamada', modalidad: 'enlinea' },
  { id: 'mab-cusco', nombre: 'Match and Building · Cusco', descripcion: 'La dinámica de match y construcción llega a Cusco. Conoce a las personas que el match te sugiere y descubre con quién podrías formar equipo.', dias: 80, zona: 'lima', lugar: 'Cusco' },
  { id: 'mesa-equipos', nombre: 'Mesa redonda: equipos técnicos y de negocio', descripcion: 'Cómo se complementan los perfiles técnicos y de negocio en un equipo fundador, contado por quienes ya lo viven. Con tiempo para preguntas del público.', dias: 87, zona: 'mexico', lugar: 'Ciudad de México' },
  { id: 'clinica-finanzas', nombre: 'Clínica de modelos financieros', descripcion: 'Revisión en grupo de modelos financieros de proyectos de la comunidad. Trae tu hoja de cálculo y recibe comentarios sobre ingresos, costos y flujo de caja.', dias: 94, zona: 'lima', lugar: 'Por videollamada', modalidad: 'enlinea' },
  { id: 'networking-trujillo', nombre: 'Noche de networking · Trujillo', descripcion: 'Una noche para conocer a la comunidad de Trujillo, compartir en qué trabaja cada quien y encontrar personas con perfiles que complementen el tuyo.', dias: 101, zona: 'lima', lugar: 'Trujillo' },
  { id: 'taller-validacion', nombre: 'Taller de validación de ideas', descripcion: 'Métodos simples para probar una idea antes de construirla: cómo conversar con posibles clientes y qué señales indican que vale la pena seguir.', dias: 108, zona: 'lima', lugar: 'Lima' },
  { id: 'mab-bogota', nombre: 'Match and Building · Bogotá', descripcion: 'La dinámica de match y construcción llega a Bogotá. Recibe tus conexiones sugeridas y habla con las personas que mejor complementan tu idea.', dias: 115, zona: 'bogota', lugar: 'Bogotá' },
  { id: 'conversatorio-operadores', nombre: 'Conversatorio con operadores', descripcion: 'Quienes ya operan empresas cuentan cómo organizan procesos, proveedores y equipos. Una conversación abierta con tiempo para preguntas sobre logística y crecimiento.', dias: 122, zona: 'buenosAires', lugar: 'Buenos Aires' },
  { id: 'preguntas-inversionistas', nombre: 'Sesión de preguntas con inversionistas', descripcion: 'Una hora para resolver dudas sobre levantar capital: cuándo hacerlo, qué esperan los inversionistas de un equipo temprano y qué errores evitar.', dias: 129, zona: 'lima', lugar: 'Por videollamada', modalidad: 'enlinea' },
  { id: 'cafe-cofundadores', nombre: 'Café de cofundadores', descripcion: 'Una conversación informal, café en mano, para encontrar socio. Cada persona cuenta qué busca y qué ofrece, y se arman charlas de a dos.', dias: 136, zona: 'lima', lugar: 'Lima' },
  { id: 'taller-acuerdos', nombre: 'Taller: acuerdos entre socios', descripcion: 'Qué conversar y dejar por escrito entre cofundadores: reparto de propiedad, dedicación, roles y qué pasa si alguien se va del proyecto.', dias: 143, zona: 'lima', lugar: 'Lima' },
  { id: 'mab-mexico', nombre: 'Match and Building · Ciudad de México', descripcion: 'La dinámica de match y construcción llega a Ciudad de México. Conoce a quienes el match te sugiere y empieza a armar tu equipo fundador.', dias: 150, zona: 'mexico', lugar: 'Ciudad de México' },
  { id: 'charla-primer-producto', nombre: 'Charla: cómo vender tu primer producto', descripcion: 'Tácticas de ventas para equipos que empiezan: cómo preparar una oferta clara, cómo cerrar los primeros acuerdos y cómo aprender de cada conversación.', dias: 157, zona: 'lima', lugar: 'Por videollamada', modalidad: 'enlinea' },
  { id: 'encuentro-mujeres', nombre: 'Encuentro de mujeres fundadoras', descripcion: 'Un espacio para que las mujeres fundadoras se conozcan, compartan lo que han aprendido y se apoyen para encontrar equipo y recursos.', dias: 164, zona: 'lima', lugar: 'Lima' },
  { id: 'taller-finanzas', nombre: 'Taller de finanzas para no financieros', descripcion: 'Lo esencial para entender los números de tu proyecto sin ser financiero: costos, precios, margen y cuánto dinero necesitas para llegar al primer año.', dias: 171, zona: 'lima', lugar: 'Lima' },
  { id: 'networking-piura', nombre: 'Noche de networking · Piura', descripcion: 'Una noche para conocer a la comunidad de Piura, contar en qué trabajas y encontrar a alguien con quien construir tu proyecto.', dias: 178, zona: 'lima', lugar: 'Piura' },
  { id: 'mab-buenos-aires', nombre: 'Match and Building · Buenos Aires', descripcion: 'La dinámica de match y construcción llega a Buenos Aires. Descubre quién te complementa y conversa con cada persona a partir de una pregunta pensada para ti.', dias: 185, zona: 'buenosAires', lugar: 'Buenos Aires' },
  { id: 'sesion-aliados', nombre: 'Sesión abierta con aliados', descripcion: 'Conoce a las organizaciones que respaldan a la comunidad y entiende cómo pueden ayudarte con espacios, mentoría, contactos o capital.', dias: 192, zona: 'lima', lugar: 'Por videollamada', modalidad: 'enlinea' },
  { id: 'taller-operaciones', nombre: 'Taller de operaciones para startups', descripcion: 'Procesos y logística para startups: cómo documentar lo que haces, elegir proveedores y prepararte para crecer sin que todo dependa de una sola persona.', dias: 199, zona: 'lima', lugar: 'Arequipa' },
  { id: 'desayuno-mentores', nombre: 'Desayuno de mentores', descripcion: 'Una mañana con mentores de la red para conversar de a pocos sobre tu proyecto y recibir consejos concretos sobre los próximos pasos.', dias: 206, zona: 'lima', lugar: 'Lima' },
  { id: 'mab-guayaquil', nombre: 'Match and Building · Guayaquil', descripcion: 'La dinámica de match y construcción llega a Guayaquil. Recibe tus conexiones sugeridas y conoce a quienes pueden ser tus futuros cofundadores.', dias: 213, zona: 'guayaquil', lugar: 'Guayaquil' },
  { id: 'charla-errores', nombre: 'Charla: errores comunes al fundar', descripcion: 'Los errores que más se repiten en los equipos que no llegan lejos, contados con casos reales, y qué hacer para evitarlos desde el primer día.', dias: 220, zona: 'lima', lugar: 'Por videollamada', modalidad: 'enlinea' },
  { id: 'encuentro-fin-de-anio', nombre: 'Encuentro de fin de año', descripcion: 'Un cierre de año para toda la comunidad: repasamos lo vivido, celebramos los equipos que se formaron y conocemos a quienes se suman el próximo año.', dias: 227, zona: 'lima', lugar: 'Lima' },
  { id: 'taller-equipo-ventas', nombre: 'Taller: tu primer equipo de ventas', descripcion: 'Cómo armar y dirigir un equipo comercial pequeño: a quién contratar primero, cómo repartir objetivos y qué medir cada semana para saber si funciona.', dias: 234, zona: 'bogota', lugar: 'Bogotá' },
]

const HORA_LOCAL = 18

export class MockEventoRepository implements EventoRepository {
  constructor(private readonly ahora: () => Date = () => new Date()) {}

  async listarEventos(): Promise<Evento[]> {
    const base = this.ahora()
    return FICHAS.map((ficha) => {
      const { zona, utc } = ZONAS[ficha.zona]
      // 18:00 hora local = 18:00 - utc en UTC (por ejemplo 18 - (-5) = 23:00 UTC)
      const inicio = new Date(
        Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + ficha.dias, HORA_LOCAL - utc),
      ).toISOString()
      return {
        id: ficha.id,
        nombre: ficha.nombre,
        descripcion: ficha.descripcion,
        inicio,
        zonaHoraria: zona,
        lugar: ficha.lugar,
        modalidad: ficha.modalidad ?? 'presencial',
      }
    })
  }
}
