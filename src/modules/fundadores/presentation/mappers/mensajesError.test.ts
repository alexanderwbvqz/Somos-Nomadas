import { describe, expect, it } from 'vitest'
import { en } from '../../language/en'
import { es } from '../../language/es'
import { mensajeDeErrorPerfil } from './mensajesError'

describe('mensajeDeErrorPerfil', () => {
  it('sin código de error no hay mensaje', () => {
    expect(mensajeDeErrorPerfil(es.bienvenida, 'nombre', undefined)).toBeUndefined()
  })

  it('el mensaje de "obligatorio" depende del campo', () => {
    expect(mensajeDeErrorPerfil(es.bienvenida, 'nombre', 'obligatorio')).toBe('Escribe tu nombre.')
    expect(mensajeDeErrorPerfil(es.bienvenida, 'apellidos', 'obligatorio')).toBe('Escribe tus apellidos.')
    expect(mensajeDeErrorPerfil(es.bienvenida, 'pais', 'obligatorio')).toBe('Elige tu país.')
  })

  it('los demás códigos tienen su mensaje y cambian con el idioma', () => {
    for (const codigo of ['textoLargo', 'busquedaVacia'] as const) {
      expect(mensajeDeErrorPerfil(es.bienvenida, 'ciudad', codigo)).toBeTruthy()
      expect(mensajeDeErrorPerfil(en.bienvenida, 'ciudad', codigo)).not.toBe(mensajeDeErrorPerfil(es.bienvenida, 'ciudad', codigo))
    }
  })
})
