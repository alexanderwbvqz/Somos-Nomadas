import { describe, expect, it } from 'vitest'
import type { Aliado } from './Aliado'
import { aliadosSimilares, contactoDe, esIdReservado, numeroWhatsappValido, tieneContacto, urlSegura } from './detalle'

function aliado(id: string, tipo: Aliado['tipo'], extra: Partial<Aliado> = {}): Aliado {
  return { id, nombre: id, tipo, descripcion: '', descripcionLarga: [], datosClave: [], areas: [], apoyos: [], redes: [], ...extra }
}

describe('esIdReservado', () => {
  it('"postular" es una ruta fija y no puede ser el id de un aliado', () => {
    expect(esIdReservado('postular')).toBe(true)
    expect(esIdReservado('cowork-plaza')).toBe(false)
  })
})

describe('urlSegura', () => {
  it('acepta http y https', () => {
    expect(urlSegura('https://ejemplo.com/agenda')).toBe('https://ejemplo.com/agenda')
    expect(urlSegura('http://ejemplo.com')).toBe('http://ejemplo.com/')
  })

  it('rechaza esquemas peligrosos, texto suelto y vacíos', () => {
    expect(urlSegura('javascript:alert(1)')).toBeUndefined()
    expect(urlSegura('data:text/html,<script>1</script>')).toBeUndefined()
    expect(urlSegura('ejemplo.com')).toBeUndefined()
    expect(urlSegura('')).toBeUndefined()
    expect(urlSegura(undefined)).toBeUndefined()
  })
})

describe('numeroWhatsappValido', () => {
  it('acepta solo dígitos, de 8 a 15', () => {
    expect(numeroWhatsappValido('51973356545')).toBe('51973356545')
    expect(numeroWhatsappValido('+51973356545')).toBeUndefined()
    expect(numeroWhatsappValido('51 973 356 545')).toBeUndefined()
    expect(numeroWhatsappValido('1234567')).toBeUndefined()
    expect(numeroWhatsappValido('1234567890123456')).toBeUndefined()
    expect(numeroWhatsappValido(undefined)).toBeUndefined()
  })
})

describe('contactoDe / tieneContacto', () => {
  it('devuelve solo las formas de contacto válidas', () => {
    const completo = aliado('a', 'mentores', { whatsapp: '51973356545', enlaceAgenda: 'https://cal.example/a' })
    expect(contactoDe(completo)).toEqual({ agenda: 'https://cal.example/a', whatsapp: '51973356545' })
    expect(tieneContacto(completo)).toBe(true)
  })

  it('con un dato inválido o ausente, esa forma de contacto no cuenta', () => {
    const roto = aliado('a', 'mentores', { whatsapp: 'no-es-un-numero', enlaceAgenda: 'javascript:alert(1)' })
    expect(contactoDe(roto)).toEqual({ agenda: undefined, whatsapp: undefined })
    expect(tieneContacto(roto)).toBe(false)
    expect(tieneContacto(aliado('b', 'mentores', { whatsapp: '51973356545' }))).toBe(true)
  })
})

describe('aliadosSimilares', () => {
  const todos = [aliado('a', 'mentores'), aliado('b', 'organizadores'), aliado('c', 'mentores'), aliado('d', 'mentores'), aliado('e', 'mentores'), aliado('f', 'mentores')]

  it('devuelve otros del mismo tipo, sin el propio, en orden y hasta tres', () => {
    expect(aliadosSimilares(todos, todos[0]!).map((a) => a.id)).toEqual(['c', 'd', 'e'])
  })

  it('si no hay otros del mismo tipo devuelve una lista vacía', () => {
    expect(aliadosSimilares(todos, todos[1]!)).toEqual([])
  })

  it('respeta el máximo indicado', () => {
    expect(aliadosSimilares(todos, todos[0]!, 1).map((a) => a.id)).toEqual(['c'])
  })
})
