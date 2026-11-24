import { describe, expect, it } from 'vitest'
import { preguntasForma } from '../../domain/forma'
import { en } from '../../language/en'
import { es } from '../../language/es'
import { indiceInicial, mensajeDeErrorSocio, vistaForma } from './vistaForma'

describe('vistaForma', () => {
  it('muestra las seis preguntas, cada una con sus tres opciones y los textos del idioma', () => {
    const vista = vistaForma(es.forma, {})
    expect(vista.map((pregunta) => pregunta.id)).toEqual(preguntasForma.map((pregunta) => pregunta.id))
    expect(vista[0]?.titulo).toBe('¿Cuánto tiempo dedicarías a un proyecto propio?')
    expect(vista[0]?.opciones).toEqual([
      { id: 'menosDe10', titulo: 'Menos de 10 horas', texto: 'A la semana, junto con otra cosa.', elegida: false },
      { id: 'de10a20', titulo: '10 a 20 horas', texto: 'Una parte importante de tu semana.', elegida: false },
      { id: 'masDe20', titulo: 'Más de 20 horas', texto: 'Sería lo principal.', elegida: false },
    ])
    for (const pregunta of vista) expect(pregunta.opciones).toHaveLength(3)
  })

  it('marca lo que eligió y lo deja como respuesta; lo demás queda sin contestar', () => {
    const vista = vistaForma(es.forma, { arranque: 'yaMismo', riesgo: 'seguro' })
    expect(vista.find((pregunta) => pregunta.id === 'arranque')?.respuesta).toEqual({ id: 'yaMismo', titulo: 'Ya mismo' })
    expect(vista.find((pregunta) => pregunta.id === 'arranque')?.opciones.filter((opcion) => opcion.elegida)).toHaveLength(1)
    expect(vista.find((pregunta) => pregunta.id === 'riesgo')?.respuesta?.titulo).toBe('Voy sobre seguro')
    expect(vista.filter((pregunta) => pregunta.respuesta !== undefined)).toHaveLength(2)
  })

  it('cambia con el idioma', () => {
    expect(vistaForma(en.forma, {})[1]?.titulo).toBe('When do you want to start?')
  })
})

describe('indiceInicial', () => {
  it('sin nada contestado, la primera', () => {
    expect(indiceInicial({})).toBe(0)
  })

  it('empieza por la primera que falta', () => {
    expect(indiceInicial({ dedicacion: 'masDe20', arranque: 'yaMismo' })).toBe(2)
    expect(indiceInicial({ arranque: 'yaMismo' })).toBe(0)
  })

  it('con las seis contestadas, el final', () => {
    expect(indiceInicial({ dedicacion: 'masDe20', arranque: 'yaMismo', modalidad: 'remota', decision: 'rapido', riesgo: 'seguro', ritmo: 'intenso' })).toBe(6)
  })
})

describe('mensajeDeErrorSocio', () => {
  it('el del texto largo lleva el máximo; sin error no hay mensaje', () => {
    expect(mensajeDeErrorSocio(es.forma, 'textoLargo')).toBe('Es demasiado largo. Máximo 800 caracteres.')
    expect(mensajeDeErrorSocio(es.forma, undefined)).toBeUndefined()
    expect(mensajeDeErrorSocio(en.forma, 'textoLargo')).not.toBe(mensajeDeErrorSocio(es.forma, 'textoLargo'))
  })
})
