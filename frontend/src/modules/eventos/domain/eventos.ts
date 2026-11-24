import type { Evento } from './Evento'

/** Eventos que aún no han empezado, del más cercano al más lejano */
export function eventosFuturos(eventos: Evento[], ahora: Date): Evento[] {
  return eventos
    .filter((evento) => new Date(evento.inicio).getTime() > ahora.getTime())
    .sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime())
}

function diaCalendario(fecha: Date, zonaHoraria: string): number {
  const [anio, mes, dia] = new Intl.DateTimeFormat('en-CA', {
    timeZone: zonaHoraria,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(fecha)
    .split('-')
    .map(Number)
  return Date.UTC(anio ?? 0, (mes ?? 1) - 1, dia ?? 1)
}

/** Días de calendario (en la zona del evento) entre hoy y el inicio: 0 es hoy, 1 es mañana */
export function diasHasta(inicio: string, ahora: Date, zonaHoraria: string): number {
  const MS_POR_DIA = 24 * 60 * 60 * 1000
  return Math.round((diaCalendario(new Date(inicio), zonaHoraria) - diaCalendario(ahora, zonaHoraria)) / MS_POR_DIA)
}
