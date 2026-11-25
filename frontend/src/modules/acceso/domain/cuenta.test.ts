import { describe, expect, it } from 'vitest'
import {
  datosRegistroVacios,
  esRobotRegistro,
  fuerzaDeClave,
  hayErroresCuenta,
  limpiarRegistro,
  normalizarCorreo,
  validarInicioSesion,
  validarRegistro,
  type DatosRegistro,
} from './cuenta'

function completos(): DatosRegistro {
  return { ...datosRegistroVacios(), correo: 'Ana@Correo.com', clave: 'Clave-segura-9', aceptaPolitica: true }
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
    expect(validarRegistro({ ...completos(), clave: '        ' }).clave).toBe('claveSinMinuscula')
    expect(validarRegistro({ ...completos(), clave: 'Aa1 aaaa' }).clave).toBeUndefined()
    expect(validarRegistro({ ...completos(), clave: 'a'.repeat(129) }).clave).toBe('claveLarga')
  })

  it('exige minúscula, mayúscula, número y símbolo, y avisa de la primera que falta', () => {
    expect(validarRegistro({ ...completos(), clave: 'CLAVE-SEGURA-9' }).clave).toBe('claveSinMinuscula')
    expect(validarRegistro({ ...completos(), clave: 'clave-segura-9' }).clave).toBe('claveSinMayuscula')
    expect(validarRegistro({ ...completos(), clave: 'Clave-segura-x' }).clave).toBe('claveSinNumero')
    expect(validarRegistro({ ...completos(), clave: 'Clavesegura9' }).clave).toBe('claveSinEspecial')
    // Si faltan varias, manda el orden: minúscula, mayúscula, número, símbolo
    expect(validarRegistro({ ...completos(), clave: '!!!!!!!!' }).clave).toBe('claveSinMinuscula')
    expect(validarRegistro({ ...completos(), clave: 'aaaa!!!!' }).clave).toBe('claveSinMayuscula')
    expect(validarRegistro({ ...completos(), clave: 'Aaaa!!!!' }).clave).toBe('claveSinNumero')
  })

  it('la ñ y las tildes son letras, no símbolos; el espacio sí es símbolo', () => {
    expect(validarRegistro({ ...completos(), clave: 'Ñandú1ñandú' }).clave).toBe('claveSinEspecial')
    expect(validarRegistro({ ...completos(), clave: 'Ñandú 1ñandú' }).clave).toBeUndefined()
  })

  it('cuenta caracteres, no unidades de JavaScript: un emoji es uno', () => {
    expect(validarRegistro({ ...completos(), clave: 'Aa1😀😀😀😀' }).clave).toBe('claveCorta')
    expect(validarRegistro({ ...completos(), clave: 'Aa1😀😀😀😀😀' }).clave).toBeUndefined()
    expect(validarRegistro({ ...completos(), clave: 'Aa1!' + '😀'.repeat(124) }).clave).toBeUndefined()
    expect(validarRegistro({ ...completos(), clave: 'Aa1!' + '😀'.repeat(125) }).clave).toBe('claveLarga')
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
  it('es 0 mientras incumpla alguna regla, y sube con el largo una vez que las cumple', () => {
    expect(fuerzaDeClave('Aa1!')).toBe(0)
    expect(fuerzaDeClave('sololetrassolo')).toBe(0)
    expect(fuerzaDeClave('Aa1!aaaa')).toBe(1)
    expect(fuerzaDeClave('Aa1!aaaaaaaa')).toBe(2)
    expect(fuerzaDeClave('Aa1!aaaaaaaaaaaa')).toBe(3)
  })

  it('es 0 si pasa del máximo, aunque cumpla las reglas', () => {
    expect(fuerzaDeClave('Aa1!' + 'a'.repeat(125))).toBe(0)
  })
})

describe('normalizarCorreo', () => {
  it('recorta los mismos espacios que el backend, no los de trim() de JavaScript', () => {
    expect(normalizarCorreo('\x1c\u3000Ana@Correo.com\x1f')).toBe('ana@correo.com')
    // El BOM no es un espacio para el backend: se queda y el correo no vale
    expect(normalizarCorreo('\ufeffana@correo.com')).toBe('\ufeffana@correo.com')
    expect(limpiarRegistro({ ...completos(), correo: '\x1cAna@Correo.com' }).correo).toBe('ana@correo.com')
  })

  it('un espacio dentro del correo lo invalida, sea del tipo que sea', () => {
    expect(validarInicioSesion({ correo: 'ana\u3000@correo.com', clave: 'x' }).correo).toBe('correoInvalido')
    expect(validarInicioSesion({ correo: 'ana@correo.com@correo.com', clave: 'x' }).correo).toBe('correoInvalido')
  })
})

describe('limpiarRegistro', () => {
  it('pone el correo en minúsculas y deja la contraseña intacta', () => {
    expect(limpiarRegistro({ ...completos(), correo: '  Ana@Correo.com ', clave: ' clave con espacios ' })).toEqual({
      correo: 'ana@correo.com',
      clave: ' clave con espacios ',
      aceptaPolitica: true,
    })
  })
})
