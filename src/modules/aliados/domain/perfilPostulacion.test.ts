import { describe, expect, it } from 'vitest'
import {
  contactoValido,
  contarPartesListas,
  partesDelPerfil,
  sitioParaMostrar,
} from './perfilPostulacion'
import { datosPostulacionVacios } from './postulacion'

const veinte = Array.from({ length: 20 }, (_, i) => `palabra${i}`).join(' ')

describe('partesDelPerfil', () => {
  it('con el formulario vacío no hay nada listo', () => {
    const partes = partesDelPerfil(datosPostulacionVacios())
    expect(contarPartesListas(partes)).toBe(0)
  })

  it('marca cada parte cuando se completa', () => {
    const datos = {
      ...datosPostulacionVacios(),
      tipo: 'mentores' as const,
      nombre: 'Ana',
      descripcionCorta: veinte,
      areas: ['Legal'],
      ciudad: 'Lima',
      whatsapp: '+51 973 356 545',
    }
    expect(partesDelPerfil(datos)).toEqual({
      nombreYTipo: true,
      descripcionCorta: true,
      detalle: true,
      presencia: true,
      contacto: true,
    })
  })

  it('el nombre sin tipo no cuenta; una descripción corta de menos de 20 palabras tampoco', () => {
    const partes = partesDelPerfil({ ...datosPostulacionVacios(), nombre: 'Ana', descripcionCorta: 'poco' })
    expect(partes.nombreYTipo).toBe(false)
    expect(partes.descripcionCorta).toBe(false)
  })

  it('un dato clave a medias no cuenta', () => {
    const datos = { ...datosPostulacionVacios(), datosClave: [{ valor: '10', etiqueta: '' }] }
    expect(partesDelPerfil(datos).detalle).toBe(false)
  })
})

describe('contactoValido', () => {
  it('reconoce WhatsApp y agenda válidos', () => {
    const datos = { ...datosPostulacionVacios(), whatsapp: '973356545', enlaceAgenda: 'cal.com/ana' }
    expect(contactoValido(datos)).toEqual({ whatsapp: true, agenda: true })
    expect(contactoValido({ ...datos, whatsapp: 'x', enlaceAgenda: 'javascript:alert(1)' })).toEqual({
      whatsapp: false,
      agenda: false,
    })
  })
})

describe('sitioParaMostrar', () => {
  it('deja solo el dominio', () => {
    expect(sitioParaMostrar('https://www.cowork.com/inicio')).toBe('cowork.com')
    expect(sitioParaMostrar('cowork.com')).toBe('cowork.com')
  })
  it('devuelve undefined si no es válido', () => {
    expect(sitioParaMostrar('')).toBeUndefined()
    expect(sitioParaMostrar('javascript:alert(1)')).toBeUndefined()
  })
})
