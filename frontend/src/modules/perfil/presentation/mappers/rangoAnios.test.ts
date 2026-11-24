import { describe, expect, it } from 'vitest'
import { rangoAnios } from './rangoAnios'

describe('rangoAnios', () => {
  it('une los dos años cuando la entrada terminó', () => {
    expect(rangoAnios({ desde: 2020, hasta: 2022, rol: 'Dev', donde: 'Estudio', que: '' }, 'hoy')).toBe('2020 – 2022')
  })

  it('pone la palabra de «hoy» del idioma cuando sigue ahí', () => {
    const entrada = { desde: 2022, rol: 'Dev', donde: 'Estudio', que: '' }
    expect(rangoAnios(entrada, 'hoy')).toBe('2022 – hoy')
    expect(rangoAnios(entrada, 'today')).toBe('2022 – today')
  })
})
