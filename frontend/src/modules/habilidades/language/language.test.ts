import { describe, expect, it } from 'vitest'
import { areas, grupos, habilidades } from '../domain/catalogo'
import { preguntasForma } from '../domain/forma'
import { sectores } from '../domain/historias'
import { preguntasDe, tienePreguntasPropias } from '../domain/preguntas'
import { frecuencias } from '../domain/puntos'
import { en } from './en'
import { es } from './es'
import { pt } from './pt'

function claves(objeto: object, prefijo = ''): string[] {
  return Object.entries(objeto).flatMap(([clave, valor]) =>
    typeof valor === 'object' && valor !== null
      ? claves(valor, `${prefijo}${clave}.`)
      : [`${prefijo}${clave}`],
  )
}

describe('idiomas de habilidades', () => {
  it('en y pt tienen exactamente las claves de es', () => {
    expect(claves(en)).toEqual(claves(es))
    expect(claves(pt)).toEqual(claves(es))
  })

  it('cada idioma tiene un texto para cada tarea, cada grupo y cada frecuencia del dominio', () => {
    for (const textos of [es, en, pt]) {
      expect(Object.keys(textos.tareas.tareas).sort()).toEqual([...habilidades].sort())
      expect(Object.keys(textos.tareas.grupos).sort()).toEqual([...grupos].sort())
      expect(Object.keys(textos.tareas.frecuencias).sort()).toEqual([...frecuencias].sort())
    }
  })

  it('los textos con variables las llevan en todos los idiomas', () => {
    for (const textos of [es, en, pt]) {
      expect(textos.comun.paso).toContain('{actual}')
      expect(textos.comun.paso).toContain('{total}')
      expect(textos.tareas.contadorGrupo).toContain('{n}')
      expect(textos.tareas.contadorTotal).toContain('{total}')
      expect(textos.tareas.vecesDe).toContain('{tarea}')
      expect(textos.profundizar.habilidadN).toContain('{n}')
      expect(textos.profundizar.habilidadN).toContain('{total}')
      expect(textos.profundizar.loHasHecho).toContain('{veces}')
      expect(textos.profundizar.siguienteHabilidad).toContain('{habilidad}')
      expect(textos.profundizar.preguntas.tiempo).toContain('{habilidad}')
      expect(textos.profundizar.preguntas.quien).toContain('{habilidad}')
      expect(textos.profundizar.preguntas.textoGenerico.pregunta).toContain('{habilidad}')
      expect(textos.profundizar.preguntas.textoGenerico.ejemplo).toContain('{habilidad}')
    }
  })

  describe('«Más de lo que haces»', () => {
    const preguntas = habilidades.flatMap((habilidad) => preguntasDe(habilidad))
    const idsDeOpciones = [...new Set(preguntas.flatMap((pregunta) => (pregunta.tipo === 'texto' ? [] : pregunta.opciones)))].sort()
    const generales = ['tiempo', 'quien', 'texto']
    const idsPropios = [...new Set(preguntas.filter((pregunta) => !generales.includes(pregunta.id)).map((pregunta) => pregunta.id))].sort()
    const conTextoPropio = habilidades.filter(tienePreguntasPropias).sort()

    it('cada idioma nombra todas las habilidades', () => {
      for (const textos of [es, en, pt]) expect(Object.keys(textos.profundizar.habilidades).sort()).toEqual([...habilidades].sort())
    })

    it('cada idioma tiene texto para todas las opciones de las preguntas, y para ninguna que no exista', () => {
      for (const textos of [es, en, pt]) expect(Object.keys(textos.profundizar.preguntas.opciones).sort()).toEqual(idsDeOpciones)
    })

    it('cada idioma tiene el enunciado de todas las preguntas propias y el texto de las habilidades que lo tienen propio', () => {
      for (const textos of [es, en, pt]) {
        expect(Object.keys(textos.profundizar.preguntas.propias).sort()).toEqual(idsPropios)
        expect(Object.keys(textos.profundizar.preguntas.textoPropio).sort()).toEqual(conTextoPropio)
      }
    })

    it('una misma opción no se usa en dos preguntas distintas (los textos se buscan solo por su id)', () => {
      const preguntasPorOpcion = new Map<string, Set<string>>()
      for (const pregunta of preguntas) {
        if (pregunta.tipo === 'texto') continue
        for (const opcion of pregunta.opciones) preguntasPorOpcion.set(opcion, (preguntasPorOpcion.get(opcion) ?? new Set()).add(pregunta.id))
      }
      for (const [opcion, usadaEn] of preguntasPorOpcion) expect(usadaEn.size, opcion).toBe(1)
    })
  })

  describe('«Tu forma de emprender»', () => {
    const idsDeOpciones = preguntasForma.flatMap((pregunta) => [...pregunta.opciones]).sort()

    it('cada idioma tiene el enunciado de todas las preguntas y el texto de todas las opciones, y ninguno más', () => {
      for (const textos of [es, en, pt]) {
        expect(Object.keys(textos.forma.preguntas).sort()).toEqual(preguntasForma.map((pregunta) => pregunta.id).sort())
        expect(Object.keys(textos.forma.opciones).sort()).toEqual(idsDeOpciones)
        expect(Object.keys(textos.forma.busca.areas).sort()).toEqual([...areas].sort())
      }
    })

    it('una misma opción no se repite entre preguntas (los textos se buscan solo por su id)', () => {
      expect(new Set(idsDeOpciones).size).toBe(idsDeOpciones.length)
    })

    it('los textos con variables las llevan en todos los idiomas', () => {
      for (const textos of [es, en, pt]) {
        expect(textos.forma.progreso).toContain('{n}')
        expect(textos.forma.progreso).toContain('{total}')
        expect(textos.forma.resumen).toContain('{n}')
        expect(textos.forma.resumen).toContain('{total}')
        expect(textos.forma.listo).toContain('{n}')
        expect(textos.forma.listo).toContain('{total}')
        expect(textos.forma.errores.textoLargo).toContain('{max}')
      }
    })
  })

  describe('«Tus historias»', () => {
    it('cada idioma nombra todos los sectores del dominio, y ninguno más', () => {
      for (const textos of [es, en, pt]) expect(Object.keys(textos.historias.sectores.nombres).sort()).toEqual([...sectores].sort())
    })

    it('los textos con variables las llevan en todos los idiomas', () => {
      for (const textos of [es, en, pt]) {
        expect(textos.historias.sectores.ayuda).toContain('{max}')
        expect(textos.historias.sectores.contador).toContain('{n}')
        expect(textos.historias.sectores.contador).toContain('{max}')
        expect(textos.historias.errores.textoLargo).toContain('{max}')
        expect(textos.historias.errores.demasiadosSectores).toContain('{max}')
      }
    })
  })
})
