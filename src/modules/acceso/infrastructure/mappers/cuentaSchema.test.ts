import { describe, expect, it } from 'vitest'
import { datosRegistroVacios } from '../../domain/cuenta'
import { leerCorreo, leerDatosInicioSesion, leerDatosRegistro } from './cuentaSchema'

describe('leerDatosRegistro', () => {
  it('acepta unos datos con la forma correcta', () => {
    expect(leerDatosRegistro(datosRegistroVacios())).toEqual(datosRegistroVacios())
  })
  it('rechaza lo que no es un objeto, tipos equivocados, países desconocidos y textos desmesurados', () => {
    expect(leerDatosRegistro(null)).toBeUndefined()
    expect(leerDatosRegistro({})).toBeUndefined()
    expect(leerDatosRegistro({ ...datosRegistroVacios(), nombre: 5 })).toBeUndefined()
    expect(leerDatosRegistro({ ...datosRegistroVacios(), pais: 'XX' })).toBeUndefined()
    expect(leerDatosRegistro({ ...datosRegistroVacios(), clave: 'a'.repeat(100_000) })).toBeUndefined()
  })
  it('descarta campos desconocidos', () => {
    expect(leerDatosRegistro({ ...datosRegistroVacios(), extra: 'x' })).not.toHaveProperty('extra')
  })
})

describe('leerDatosInicioSesion y leerCorreo', () => {
  it('aceptan la forma correcta y rechazan el resto', () => {
    expect(leerDatosInicioSesion({ correo: 'a@b.co', clave: 'x' })).toEqual({ correo: 'a@b.co', clave: 'x' })
    expect(leerDatosInicioSesion({ correo: 1, clave: 'x' })).toBeUndefined()
    expect(leerCorreo('a@b.co')).toBe('a@b.co')
    expect(leerCorreo(['a@b.co'])).toBeUndefined()
  })
})
