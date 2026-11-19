import { describe, expect, it } from 'vitest'
import { datosPostulacionVacios } from '../../domain/postulacion'
import { leerDatosPostulacion } from './postulacionSchema'

describe('leerDatosPostulacion', () => {
  it('acepta unos datos con la forma correcta', () => {
    expect(leerDatosPostulacion(datosPostulacionVacios())).toEqual(datosPostulacionVacios())
  })

  it('rechaza lo que no es un objeto o le faltan campos', () => {
    expect(leerDatosPostulacion(null)).toBeUndefined()
    expect(leerDatosPostulacion('hola')).toBeUndefined()
    expect(leerDatosPostulacion({})).toBeUndefined()
  })

  it('rechaza tipos equivocados y tipos de aliado desconocidos', () => {
    expect(leerDatosPostulacion({ ...datosPostulacionVacios(), nombre: 5 })).toBeUndefined()
    expect(leerDatosPostulacion({ ...datosPostulacionVacios(), tipo: 'otro' })).toBeUndefined()
    expect(leerDatosPostulacion({ ...datosPostulacionVacios(), aceptaPolitica: 'si' })).toBeUndefined()
  })

  it('rechaza textos desmesurados y listas enormes', () => {
    expect(leerDatosPostulacion({ ...datosPostulacionVacios(), descripcionLarga: 'a'.repeat(100_000) })).toBeUndefined()
    expect(leerDatosPostulacion({ ...datosPostulacionVacios(), areas: Array(500).fill('x') })).toBeUndefined()
  })

  it('descarta campos desconocidos', () => {
    const leido = leerDatosPostulacion({ ...datosPostulacionVacios(), extra: 'x' })
    expect(leido).toBeDefined()
    expect(leido).not.toHaveProperty('extra')
  })
})
