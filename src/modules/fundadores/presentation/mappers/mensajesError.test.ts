import { describe, expect, it } from 'vitest'
import { en } from '../../language/en'
import { es } from '../../language/es'
import { mensajeDeErrorBienvenida } from './mensajesError'

describe('mensajeDeErrorBienvenida', () => {
  it('sin código de error no hay mensaje', () => {
    expect(mensajeDeErrorBienvenida(es.bienvenida, 'nombre', undefined)).toBeUndefined()
  })

  it('el mensaje de "obligatorio" depende del campo', () => {
    expect(mensajeDeErrorBienvenida(es.bienvenida, 'nombre', 'obligatorio')).toBe('Escribe tu nombre.')
    expect(mensajeDeErrorBienvenida(es.bienvenida, 'apellidos', 'obligatorio')).toBe('Escribe tus apellidos.')
    expect(mensajeDeErrorBienvenida(es.bienvenida, 'pais', 'obligatorio')).toBe('Elige tu país.')
  })

  it('los demás códigos tienen su mensaje y cambian con el idioma', () => {
    for (const codigo of ['textoLargo', 'busquedaVacia'] as const) {
      expect(mensajeDeErrorBienvenida(es.bienvenida, 'ciudad', codigo)).toBeTruthy()
      expect(mensajeDeErrorBienvenida(en.bienvenida, 'ciudad', codigo)).not.toBe(mensajeDeErrorBienvenida(es.bienvenida, 'ciudad', codigo))
    }
  })
})
