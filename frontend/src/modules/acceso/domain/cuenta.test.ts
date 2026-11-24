import { describe, expect, it } from 'vitest'
import {
  datosRegistroVacios,
  esRobotRegistro,
  fuerzaDeClave,
  hayErroresCuenta,
  limpiarRegistro,
  validarInicioSesion,
  validarRegistro,
  type DatosRegistro,
} from './cuenta'

function completos(): DatosRegistro {
  return { ...datosRegistroVacios(), correo: 'Ana@Correo.com', clave: 'clave-segura-9', aceptaPolitica: true }
}

describe('validarRegistro', () => {
  it('acepta unos datos completos', () => {
    expect(hayErroresCuenta(validarRegistro(completos()))).toBe(false)
  })

  it('con el formulario vacío pide solo correo, contraseña y la política: nada de nombre ni país', () => {
    expect(Object.keys(validarRegistro(datosRegistroVacios())).sort()).toEqual(['aceptaPolitica', 'clave', 'correo'])
  })

  it('detecta un correo inválido', () => {
    expect(validarRegistro({ ...completos(), correo: 'ana@correo' }).correo).toBe('correoInvalido')
    expect(validarRegistro({ ...completos(), correo: 'a'.repeat(121) + '@correo.com' }).correo).toBe('correoInvalido')
  })

  it('exige al menos 8 caracteres en la contraseña, sin recortar espacios', () => {
    expect(validarRegistro({ ...completos(), clave: '1234567' }).clave).toBe('claveCorta')
    expect(validarRegistro({ ...completos(), clave: '        ' }).clave).toBeUndefined()
    expect(validarRegistro({ ...completos(), clave: 'a'.repeat(129) }).clave).toBe('claveLarga')
  })

  it('exige aceptar la política', () => {
    expect(validarRegistro({ ...completos(), aceptaPolitica: false }).aceptaPolitica).toBe('politicaRequerida')
  })
})

describe('validarInicioSesion', () => {
  it('pide correo y contraseña', () => {
    expect(validarInicioSesion({ correo: '', clave: '' })).toEqual({ correo: 'obligatorio', clave: 'obligatorio' })
  })
  it('no exige un largo mínimo (solo el registro lo exige)', () => {
    expect(validarInicioSesion({ correo: 'ana@correo.com', clave: 'x' })).toEqual({})
  })
})

describe('esRobotRegistro', () => {
  it('detecta el campo trampa relleno', () => {
    expect(esRobotRegistro(completos())).toBe(false)
    expect(esRobotRegistro({ ...completos(), sitioSecundario: 'http://spam' })).toBe(true)
  })
})

describe('fuerzaDeClave', () => {
  it('sube con la mezcla de letras y números y con el largo', () => {
    expect(fuerzaDeClave('corta')).toBe(0)
    expect(fuerzaDeClave('sololetras')).toBe(1)
    expect(fuerzaDeClave('letras123')).toBe(2)
    expect(fuerzaDeClave('letras1234567')).toBe(3)
  })
})

describe('limpiarRegistro', () => {
  it('pone el correo en minúsculas y deja la contraseña intacta', () => {
    expect(limpiarRegistro({ ...completos(), correo: '  Ana@Correo.com ', clave: ' clave con espacios ' })).toEqual({
      correo: 'ana@correo.com',
      clave: ' clave con espacios ',
    })
  })
})
