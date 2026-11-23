import { describe, expect, it } from 'vitest'
import { en } from '../../language/en'
import { es } from '../../language/es'
import { textoSaludo } from './saludo'

describe('textoSaludo', () => {
  it('saluda por el nombre', () => {
    expect(textoSaludo(es.inicio, 'Ana')).toBe('Hola, Ana. Empecemos por ti.')
  })

  it('sin nombre, o con uno en blanco, saluda sin él', () => {
    expect(textoSaludo(es.inicio, undefined)).toBe('Empecemos por ti.')
    expect(textoSaludo(es.inicio, '   ')).toBe('Empecemos por ti.')
  })

  it('cambia con el idioma', () => {
    expect(textoSaludo(en.inicio, 'Ana')).toBe("Hi, Ana. Let's start with you.")
  })
})
