import { describe, expect, it } from 'vitest'
import { en } from '../../language/en'
import { es } from '../../language/es'
import { mensajeDeErrorHistorias } from './mensajesErrorHistorias'

describe('mensajeDeErrorHistorias', () => {
  it('sin código de error no hay mensaje', () => {
    expect(mensajeDeErrorHistorias(es.historias, undefined)).toBeUndefined()
  })

  it('el del largo lleva el máximo de caracteres y el de los sectores, el máximo de sectores', () => {
    expect(mensajeDeErrorHistorias(es.historias, 'textoLargo')).toBe('Es demasiado largo. Máximo 1200 caracteres.')
    expect(mensajeDeErrorHistorias(es.historias, 'demasiadosSectores')).toBe('Elige como máximo 5 sectores.')
  })

  it('los demás devuelven su texto y todos cambian con el idioma', () => {
    for (const codigo of ['textoLargo', 'demasiadosSectores', 'faltaPermiso', 'sectorInvalido'] as const) {
      expect(mensajeDeErrorHistorias(es.historias, codigo)).toBeTruthy()
      expect(mensajeDeErrorHistorias(en.historias, codigo)).not.toBe(mensajeDeErrorHistorias(es.historias, codigo))
    }
    expect(mensajeDeErrorHistorias(es.historias, 'faltaPermiso')).toBe(es.historias.errores.faltaPermiso)
  })
})
