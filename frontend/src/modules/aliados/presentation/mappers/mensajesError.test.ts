import { describe, expect, it } from 'vitest'
import { en } from '../../language/en'
import { es } from '../../language/es'
import { mensajeDeError } from './mensajesError'

describe('mensajeDeError', () => {
  it('sin código de error no hay mensaje', () => {
    expect(mensajeDeError(es.postulacion, undefined)).toBeUndefined()
  })

  it('rellena el mínimo y el máximo de palabras de la descripción corta', () => {
    expect(mensajeDeError(es.postulacion, 'pocasPalabras')).toBe('Escribe al menos 20 palabras.')
    expect(mensajeDeError(es.postulacion, 'muchasPalabras')).toBe('Usa como máximo 40 palabras.')
  })

  it('cambia con el idioma', () => {
    expect(mensajeDeError(en.postulacion, 'pocasPalabras')).toBe('Write at least 20 words.')
  })

  it('los códigos sin variables devuelven su texto tal cual', () => {
    expect(mensajeDeError(es.postulacion, 'obligatorio')).toBe(es.postulacion.errores.obligatorio)
  })
})
