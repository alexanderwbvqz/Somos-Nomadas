import { describe, expect, it } from 'vitest'
import { datosRegistroVacios } from '../../domain/cuenta'
import { leerCorreo, leerCredencial, leerDatosInicioSesion, leerDatosRegistro } from './cuentaSchema'

describe('leerDatosRegistro', () => {
  it('acepta unos datos con la forma correcta', () => {
    expect(leerDatosRegistro(datosRegistroVacios())).toEqual(datosRegistroVacios())
  })
  it('rechaza lo que no es un objeto, tipos equivocados y textos desmesurados', () => {
    expect(leerDatosRegistro(null)).toBeUndefined()
    expect(leerDatosRegistro({})).toBeUndefined()
    expect(leerDatosRegistro({ ...datosRegistroVacios(), correo: 5 })).toBeUndefined()
    expect(leerDatosRegistro({ ...datosRegistroVacios(), aceptaPolitica: 'si' })).toBeUndefined()
    expect(leerDatosRegistro({ ...datosRegistroVacios(), clave: 'a'.repeat(100_000) })).toBeUndefined()
  })
  it('descarta campos desconocidos, como los que ya no existen (nombre, país)', () => {
    const leido = leerDatosRegistro({ ...datosRegistroVacios(), extra: 'x', nombre: 'Ana', pais: 'PE' })
    expect(leido).not.toHaveProperty('extra')
    expect(leido).not.toHaveProperty('nombre')
    expect(leido).not.toHaveProperty('pais')
  })
})

describe('leerDatosInicioSesion, leerCorreo y leerCredencial', () => {
  it('aceptan la forma correcta y rechazan el resto', () => {
    expect(leerDatosInicioSesion({ correo: 'a@b.co', clave: 'x' })).toEqual({ correo: 'a@b.co', clave: 'x' })
    expect(leerDatosInicioSesion({ correo: 1, clave: 'x' })).toBeUndefined()
    expect(leerCorreo('a@b.co')).toBe('a@b.co')
    expect(leerCorreo(['a@b.co'])).toBeUndefined()
    expect(leerCredencial('token')).toBe('token')
    expect(leerCredencial('')).toBeUndefined()
    expect(leerCredencial('a'.repeat(5000))).toBeUndefined()
    expect(leerCredencial({ token: 'x' })).toBeUndefined()
  })
})
