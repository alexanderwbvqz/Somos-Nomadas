import { describe, expect, it } from 'vitest'
import { en } from '../../language/en'
import { es } from '../../language/es'
import { mensajeDeErrorMaterial } from './mensajesError'

describe('mensajeDeErrorMaterial', () => {
  it('sin código de error no hay mensaje', () => {
    expect(mensajeDeErrorMaterial(es.escritas, undefined)).toBeUndefined()
  })

  it('el del tamaño lleva el máximo en MB', () => {
    expect(mensajeDeErrorMaterial(es.escritas, 'archivoGrande')).toBe('El PDF pesa demasiado. Máximo 5 MB.')
  })

  it('los demás devuelven su texto tal cual y cambian con el idioma', () => {
    expect(mensajeDeErrorMaterial(es.escritas, 'faltaPermiso')).toBe(es.escritas.errores.faltaPermiso)
    expect(mensajeDeErrorMaterial(en.escritas, 'faltaPermiso')).not.toBe(mensajeDeErrorMaterial(es.escritas, 'faltaPermiso'))
  })
})
