import { describe, expect, it } from 'vitest'
import {
  contarPalabras,
  datosPostulacionVacios,
  esRobot,
  generarId,
  hayErrores,
  limpiarPostulacion,
  normalizarWhatsapp,
  validarPaso,
  validarPostulacion,
  type DatosPostulacion,
} from './postulacion'

const veinte = Array.from({ length: 20 }, (_, i) => `palabra${i}`).join(' ')

function completos(): DatosPostulacion {
  return {
    ...datosPostulacionVacios(),
    tipo: 'estrategicos',
    nombre: 'Cowork Plaza',
    personaContacto: 'Ana Pérez',
    correo: 'Ana@Cowork.com',
    descripcionCorta: veinte,
    whatsapp: '+51 973 356 545',
    consentimientoWhatsapp: true,
    aceptaPolitica: true,
  }
}

describe('contarPalabras', () => {
  it('cuenta palabras ignorando espacios sobrantes', () => {
    expect(contarPalabras('')).toBe(0)
    expect(contarPalabras('   ')).toBe(0)
    expect(contarPalabras(' hola   mundo \n ya ')).toBe(3)
  })
})

describe('normalizarWhatsapp', () => {
  it('deja solo dígitos', () => {
    expect(normalizarWhatsapp('+51 973-356-545')).toBe('51973356545')
  })
  it('rechaza letras y longitudes inválidas', () => {
    expect(normalizarWhatsapp('abc')).toBeUndefined()
    expect(normalizarWhatsapp('123')).toBeUndefined()
    expect(normalizarWhatsapp('')).toBeUndefined()
  })
})

describe('validarPaso', () => {
  it('paso 1 pide tipo, nombre, persona y correo', () => {
    expect(Object.keys(validarPaso(datosPostulacionVacios(), 1)).sort()).toEqual(['correo', 'nombre', 'personaContacto', 'tipo'])
  })
  it('paso 1 detecta correo inválido', () => {
    expect(validarPaso({ ...completos(), correo: 'x@y' }, 1).correo).toBe('correoInvalido')
  })
  it('paso 2 exige entre 20 y 40 palabras', () => {
    expect(validarPaso(datosPostulacionVacios(), 2).descripcionCorta).toBe('obligatorio')
    expect(validarPaso({ ...completos(), descripcionCorta: 'poco texto' }, 2).descripcionCorta).toBe('pocasPalabras')
    expect(validarPaso({ ...completos(), descripcionCorta: `${veinte} ${veinte} mas` }, 2).descripcionCorta).toBe('muchasPalabras')
    expect(validarPaso(completos(), 2)).toEqual({})
  })
  it('paso 2 pide dato completo (valor y etiqueta)', () => {
    const datos = { ...completos(), datosClave: [{ valor: '10', etiqueta: '' }] }
    expect(validarPaso(datos, 2).datosClave).toBe('obligatorio')
  })
  it('paso 3 exige WhatsApp o agenda', () => {
    const datos = { ...completos(), whatsapp: '', consentimientoWhatsapp: false }
    expect(validarPaso(datos, 3).contacto).toBe('contactoRequerido')
    expect(validarPaso({ ...datos, enlaceAgenda: 'cal.com/ana' }, 3)).toEqual({})
  })
  it('paso 3 exige consentimiento si hay WhatsApp', () => {
    expect(validarPaso({ ...completos(), consentimientoWhatsapp: false }, 3).consentimientoWhatsapp).toBe('consentimientoWhatsapp')
  })
  it('paso 3 rechaza enlaces no http(s) y redes de otro dominio', () => {
    expect(validarPaso({ ...completos(), sitioWeb: 'javascript:alert(1)' }, 3).sitioWeb).toBe('urlInvalida')
    expect(validarPaso({ ...completos(), linkedin: 'https://otro.com/x' }, 3).linkedin).toBe('urlInvalida')
    expect(validarPaso({ ...completos(), linkedin: 'linkedin.com/in/ana' }, 3).linkedin).toBeUndefined()
  })
  it('paso 4 exige aceptar la política', () => {
    expect(validarPaso({ ...completos(), aceptaPolitica: false }, 4).aceptaPolitica).toBe('politicaRequerida')
  })
})

describe('validarPostulacion', () => {
  it('acepta datos completos y rechaza vacíos', () => {
    expect(hayErrores(validarPostulacion(completos()))).toBe(false)
    expect(hayErrores(validarPostulacion(datosPostulacionVacios()))).toBe(true)
  })
})

describe('esRobot', () => {
  it('detecta el campo trampa relleno', () => {
    expect(esRobot(completos())).toBe(false)
    expect(esRobot({ ...completos(), sitioSecundario: 'http://spam' })).toBe(true)
  })
})

describe('generarId', () => {
  it('genera un slug sin tildes', () => {
    expect(generarId('Cowork Plaza Ñandú')).toBe('cowork-plaza-nandu')
  })
  it('evita ids reservados y vacíos', () => {
    expect(generarId('Postular')).toBe('postular-aliado')
    expect(generarId('!!!')).toBe('aliado')
  })
})

describe('limpiarPostulacion', () => {
  it('normaliza correo, whatsapp y enlaces', () => {
    const limpia = limpiarPostulacion({ ...completos(), enlaceAgenda: 'cal.com/ana', linkedin: 'linkedin.com/in/ana' })
    expect(limpia.correo).toBe('ana@cowork.com')
    expect(limpia.whatsapp).toBe('51973356545')
    expect(limpia.enlaceAgenda).toBe('https://cal.com/ana')
    expect(limpia.redes).toEqual([{ tipo: 'linkedin', href: 'https://linkedin.com/in/ana' }])
    expect(limpia.id).toBe('cowork-plaza')
  })
  it('no publica el WhatsApp sin consentimiento', () => {
    expect(limpiarPostulacion({ ...completos(), consentimientoWhatsapp: false }).whatsapp).toBeUndefined()
  })
  it('quita repetidos y vacíos, y separa párrafos', () => {
    const limpia = limpiarPostulacion({
      ...completos(),
      areas: ['Legal', 'legal', ' ', 'Finanzas'],
      apoyos: ['', 'Mentoría'],
      descripcionLarga: 'Uno\n\nDos  con   espacios',
    })
    expect(limpia.areas).toEqual(['Legal', 'Finanzas'])
    expect(limpia.apoyos).toEqual(['Mentoría'])
    expect(limpia.descripcionLarga).toEqual(['Uno', 'Dos con espacios'])
    expect(limpia.datosClave).toEqual([])
  })
})
