import { describe, expect, it } from 'vitest'
import { origenDeCabeceras } from './origenDeCabeceras'

const con = (cabeceras: Record<string, string>) => new Headers(cabeceras)

describe('origenDeCabeceras', () => {
  it('toma la primera dirección de x-forwarded-for', () => {
    expect(origenDeCabeceras(con({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe('203.0.113.7')
  })

  it('quita los espacios de alrededor', () => {
    expect(origenDeCabeceras(con({ 'x-forwarded-for': '  203.0.113.7  ,10.0.0.1' }))).toBe('203.0.113.7')
  })

  it('sin x-forwarded-for usa x-real-ip', () => {
    expect(origenDeCabeceras(con({ 'x-real-ip': '198.51.100.4' }))).toBe('198.51.100.4')
  })

  it('x-forwarded-for manda sobre x-real-ip', () => {
    expect(origenDeCabeceras(con({ 'x-forwarded-for': '203.0.113.7', 'x-real-ip': '198.51.100.4' }))).toBe('203.0.113.7')
  })

  it('con x-forwarded-for vacío cae a x-real-ip, y sin nada es «desconocido»', () => {
    expect(origenDeCabeceras(con({ 'x-forwarded-for': ' ', 'x-real-ip': '198.51.100.4' }))).toBe('198.51.100.4')
    expect(origenDeCabeceras(con({}))).toBe('desconocido')
  })
})
