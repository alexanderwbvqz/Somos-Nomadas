import { describe, expect, it } from 'vitest'
import { en } from '../../language/en'
import { es } from '../../language/es'
import { mensajeDeErrorEvidencia, mensajeDeErrorSobreMi, mensajeDeListaTrayectoria, mensajesDeEntradaTrayectoria } from './mensajesError'

describe('mensajeDeErrorSobreMi', () => {
  it('el texto largo lleva el máximo en el idioma; sin error no hay mensaje', () => {
    expect(mensajeDeErrorSobreMi(es.sobreMi, { texto: 'textoLargo' })).toBe('Es demasiado largo. Máximo 600 caracteres.')
    expect(mensajeDeErrorSobreMi(en.sobreMi, { texto: 'textoLargo' })).toBe('It is too long. Maximum 600 characters.')
    expect(mensajeDeErrorSobreMi(es.sobreMi, {})).toBeUndefined()
  })
})

describe('mensajesDeEntradaTrayectoria', () => {
  it('cada campo con error tiene su mensaje, y los que están bien no aparecen', () => {
    const mensajes = mensajesDeEntradaTrayectoria(es.trayectoria, { desde: 'obligatorio', rol: 'obligatorio' })
    expect(mensajes).toEqual({ desde: es.trayectoria.errores.desde, rol: es.trayectoria.errores.rol })
  })

  it('los dos códigos de año inválido dicen lo mismo, y el del término habla de no ser anterior al inicio', () => {
    expect(mensajesDeEntradaTrayectoria(es.trayectoria, { desde: 'anioInvalido' }).desde).toBe(es.trayectoria.errores.desde)
    expect(mensajesDeEntradaTrayectoria(es.trayectoria, { hasta: 'anteriorAlInicio' }).hasta).toBe(es.trayectoria.errores.hasta)
    expect(mensajesDeEntradaTrayectoria(es.trayectoria, { hasta: 'anioInvalido' }).hasta).toBe(es.trayectoria.errores.hasta)
  })

  it('un texto largo dice el máximo de ese campo: 80 para rol y dónde, 160 para lo que hizo', () => {
    const mensajes = mensajesDeEntradaTrayectoria(es.trayectoria, { rol: 'textoLargo', donde: 'textoLargo', que: 'textoLargo' })
    expect(mensajes.rol).toContain('80')
    expect(mensajes.donde).toContain('80')
    expect(mensajes.que).toContain('160')
  })

  it('«qué hiciste» es opcional: nunca pide que se escriba', () => {
    expect(mensajesDeEntradaTrayectoria(es.trayectoria, { que: 'obligatorio' }).que).toBeUndefined()
  })
})

describe('mensajeDeListaTrayectoria', () => {
  it('dice cuántas entradas caben', () => {
    expect(mensajeDeListaTrayectoria(es.trayectoria)).toBe('Ya tienes 5 entradas. Quita una para sumar otra.')
  })
})

describe('mensajeDeErrorEvidencia', () => {
  it('tiene un mensaje distinto para cada código', () => {
    const codigos = ['enlaceInvalido', 'enlaceLargo', 'repetido', 'demasiados'] as const
    const mensajes = codigos.map((codigo) => mensajeDeErrorEvidencia(es.evidencia, codigo))
    expect(new Set(mensajes).size).toBe(4)
    expect(mensajeDeErrorEvidencia(es.evidencia, 'enlaceLargo')).toContain('300')
    expect(mensajeDeErrorEvidencia(es.evidencia, 'demasiados')).toContain('5')
  })

  it('cambia con el idioma', () => {
    expect(mensajeDeErrorEvidencia(en.evidencia, 'repetido')).toBe('That link is already in the list.')
  })
})
