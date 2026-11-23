import { describe, expect, it } from 'vitest'
import { en } from '../../language/en'
import { es } from '../../language/es'
import { mensajeDeErrorCuenta } from './mensajesError'

describe('mensajeDeErrorCuenta', () => {
  it('sin código de error no hay mensaje', () => {
    expect(mensajeDeErrorCuenta(es, 'correo', undefined)).toBeUndefined()
  })

  it('el mensaje de "obligatorio" depende del campo', () => {
    expect(mensajeDeErrorCuenta(es, 'correo', 'obligatorio')).toBe('Escribe tu correo.')
    expect(mensajeDeErrorCuenta(es, 'clave', 'obligatorio')).toBe('Escribe tu contraseña.')
  })

  it('"claveCorta" lleva el mínimo de caracteres', () => {
    expect(mensajeDeErrorCuenta(es, 'clave', 'claveCorta')).toBe('Usa al menos 8 caracteres.')
    expect(mensajeDeErrorCuenta(en, 'clave', 'claveCorta')).toBe('Use at least 8 characters.')
  })

  it('cada código tiene su mensaje y cambia con el idioma', () => {
    for (const codigo of ['correoInvalido', 'claveLarga', 'politicaRequerida'] as const) {
      expect(mensajeDeErrorCuenta(es, 'correo', codigo)).toBeTruthy()
      expect(mensajeDeErrorCuenta(en, 'correo', codigo)).not.toBe(mensajeDeErrorCuenta(es, 'correo', codigo))
    }
  })
})
