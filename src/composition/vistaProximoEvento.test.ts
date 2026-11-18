import { describe, expect, it } from 'vitest'
import type { Evento } from '@/modules/eventos/domain/Evento'
import { textosEventos } from '@/modules/eventos/language'
import { vistaEventoListado, vistaProximoEvento } from './vistaProximoEvento'

const evento: Evento = {
  id: 'e1',
  nombre: 'Match and Building',
  descripcion: 'Descripción',
  inicio: '2026-12-12T23:00:00.000Z', // 18:00 en Lima
  zonaHoraria: 'America/Lima',
  lugar: 'Lima',
  modalidad: 'presencial',
}
const ahora = new Date('2026-11-18T12:00:00.000Z')
const whatsapp = (mensaje: string) => `https://wa.me/51000000000?text=${encodeURIComponent(mensaje)}`

describe('vistaProximoEvento', () => {
  it('en español: día y mes en la zona del evento, cuenta en días y mensaje con el nombre', () => {
    const vista = vistaProximoEvento(evento, 'es', textosEventos('es').proximo, ahora, whatsapp)
    expect(vista.dia).toBe('12')
    expect(vista.mesAnio.toLowerCase()).toContain('dic')
    expect(vista.mesAnio).toContain('2026')
    expect(vista.cuenta).toBe('En 24 días')
    expect(vista.modalidad).toBe('Presencial')
    expect(decodeURIComponent(vista.hrefConfirmar)).toContain('«Match and Building»')
  })

  it('la hora se muestra en la zona del evento, no en UTC', () => {
    const vista = vistaProximoEvento(evento, 'es', textosEventos('es').proximo, ahora, whatsapp)
    // 23:00 UTC son las 18:00 en Lima (en español se escribe en formato de 24 horas)
    expect(vista.hora).toBe('18:00')
    expect(vista.hora).not.toContain('23')
  })

  it('en inglés la cuenta y la modalidad salen en inglés', () => {
    const vista = vistaProximoEvento(evento, 'en', textosEventos('en').proximo, ahora, whatsapp)
    expect(vista.cuenta).toBe('In 24 days')
    expect(vista.modalidad).toBe('In person')
  })

  it('el evento del listado lleva fecha corta, lugar, modalidad y enlace de confirmación con su nombre', () => {
    const vista = vistaEventoListado(evento, 'es', textosEventos('es').proximo, whatsapp)
    expect(vista.fecha.toLowerCase()).toMatch(/^12 dic 2026$/)
    expect(vista).toMatchObject({ id: 'e1', nombre: 'Match and Building', lugar: 'Lima', modalidad: 'Presencial', descripcion: 'Descripción' })
    expect(decodeURIComponent(vista.hrefConfirmar)).toContain('«Match and Building»')
  })

  it('el evento del listado usa la fecha de su propia zona horaria', () => {
    // 23:30 UTC del 12 es el 12 en Lima (18:30), pero ya es el 13 en UTC
    const enLima = { ...evento, inicio: '2026-12-12T23:30:00.000Z' }
    const enManila = { ...evento, inicio: '2026-12-12T23:30:00.000Z', zonaHoraria: 'Asia/Manila' }
    expect(vistaEventoListado(enLima, 'es', textosEventos('es').proximo, whatsapp).fecha).toMatch(/^12 /)
    expect(vistaEventoListado(enManila, 'es', textosEventos('es').proximo, whatsapp).fecha).toMatch(/^13 /)
  })

  it('dice "Hoy" y "Mañana" cuando corresponde', () => {
    const t = textosEventos('es').proximo
    expect(vistaProximoEvento(evento, 'es', t, new Date('2026-12-12T15:00:00.000Z'), whatsapp).cuenta).toBe('Hoy')
    expect(vistaProximoEvento(evento, 'es', t, new Date('2026-12-11T15:00:00.000Z'), whatsapp).cuenta).toBe('Mañana')
  })
})
