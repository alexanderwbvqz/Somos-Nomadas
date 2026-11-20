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
  return {
    ...datosRegistroVacios(),
    nombre: 'Ana',
    apellidos: 'Pérez Rojas',
    pais: 'PE',
    correo: 'Ana@Correo.com',
    clave: 'clave-segura-9',
    aceptaPolitica: true,
  }
}

describe('validarRegistro', () => {
  it('acepta unos datos completos', () => {
    expect(hayErroresCuenta(validarRegistro(completos()))).toBe(false)
  })

  it('pide todos los campos si está vacío', () => {
    expect(Object.keys(validarRegistro(datosRegistroVacios())).sort()).toEqual(['aceptaPolitica', 'apellidos', 'clave', 'correo', 'nombre', 'pais'])
  })

  it('rechaza un país que no está en la lista', () => {
    expect(validarRegistro({ ...completos(), pais: '' }).pais).toBe('obligatorio')
    expect(validarRegistro({ ...completos(), pais: 'XX' as never }).pais).toBe('obligatorio')
  })

  it('detecta un correo inválido', () => {
    expect(validarRegistro({ ...completos(), correo: 'ana@correo' }).correo).toBe('correoInvalido')
  })

  it('exige al menos 8 caracteres en la contraseña, sin recortar espacios', () => {
    expect(validarRegistro({ ...completos(), clave: '1234567' }).clave).toBe('claveCorta')
    expect(validarRegistro({ ...completos(), clave: '        ' }).clave).toBeUndefined()
    expect(validarRegistro({ ...completos(), clave: 'a'.repeat(129) }).clave).toBe('claveLarga')
  })

  it('exige aceptar la política y no admite textos larguísimos', () => {
    expect(validarRegistro({ ...completos(), aceptaPolitica: false }).aceptaPolitica).toBe('politicaRequerida')
    expect(validarRegistro({ ...completos(), nombre: 'a'.repeat(61) }).nombre).toBe('muyLargo')
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
  it('ordena los datos: correo en minúsculas, sin espacios sobrantes y la contraseña intacta', () => {
    const limpia = limpiarRegistro({ ...completos(), nombre: '  Ana   María ', clave: ' clave con espacios ' })
    expect(limpia).toMatchObject({ nombre: 'Ana María', correo: 'ana@correo.com', pais: 'PE', clave: ' clave con espacios ' })
  })
})
