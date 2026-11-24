import { describe, expect, it } from 'vitest'
import { en } from '../../language/en'
import { es } from '../../language/es'
import { vistaSecciones } from './vistaProfundizar'

const marcas = { desarrolloWeb: 'esMiTrabajo', ciberseguridad: 'variasVeces', ventas: 'unaVez' } as const
const fuertes = ['desarrolloWeb', 'ciberseguridad', 'ventas'] as const

describe('vistaSecciones', () => {
  it('hace una sección por habilidad, con su número y cuántas veces la hizo en minúscula', () => {
    const vista = vistaSecciones(es, fuertes, marcas, {})
    expect(vista.map((s) => [s.habilidad, s.nombre, s.numero, s.total, s.veces])).toEqual([
      ['desarrolloWeb', 'Desarrollo web', 1, 3, 'es mi trabajo'],
      ['ciberseguridad', 'Ciberseguridad', 2, 3, 'varias veces'],
      ['ventas', 'Ventas', 3, 3, 'una vez'],
    ])
  })

  it('cada pregunta nombra la habilidad de la que habla, en minúscula', () => {
    const [web, ciber] = vistaSecciones(es, fuertes, marcas, {})
    expect(web?.preguntas.find((p) => p.id === 'tiempo')?.titulo).toBe('¿Cuánto tiempo llevas con desarrollo web?')
    expect(ciber?.preguntas.find((p) => p.id === 'quien')?.titulo).toBe('¿Para quién has trabajado en ciberseguridad?')
  })

  it('una habilidad con preguntas propias las usa, con su texto propio y su ejemplo', () => {
    const [web] = vistaSecciones(es, fuertes, marcas, {})
    expect(web?.preguntas.map((p) => p.id)).toEqual(['tecnologias', 'parte', 'tiempo', 'proyecto', 'texto'])
    expect(web?.preguntas[0]?.titulo).toBe('¿Con qué tecnologías trabajas?')
    const texto = web?.preguntas.at(-1)
    expect(texto).toMatchObject({ tipo: 'texto', titulo: 'Cuéntanos algo que hayas construido' })
  })

  it('una habilidad sin preguntas propias usa las genéricas, y su texto y su ejemplo nombran la habilidad', () => {
    const [, ciber] = vistaSecciones(es, fuertes, marcas, {})
    expect(ciber?.preguntas.map((p) => p.id)).toEqual(['quien', 'tiempo', 'texto'])
    const texto = ciber?.preguntas.at(-1)
    expect(texto).toMatchObject({ titulo: 'Cuéntanos algo que hayas hecho en ciberseguridad' })
    expect(texto?.tipo === 'texto' && texto.ejemplo).toContain('ciberseguridad')
  })

  it('las opciones llevan su texto y marcan las elegidas, de una o de varias', () => {
    const [web] = vistaSecciones(es, fuertes, marcas, { desarrolloWeb: { tecnologias: ['react', 'node'], parte: 'ambas', tiempo: 'unoATresAnos' } })
    const tecnologias = web?.preguntas[0]
    expect(tecnologias?.tipo === 'varias' && tecnologias.opciones.filter((o) => o.marcada).map((o) => o.texto)).toEqual(['React', 'Node.js'])
    const parte = web?.preguntas[1]
    expect(parte?.tipo === 'una' && parte.opciones.find((o) => o.marcada)?.texto).toBe('Ambas')
  })

  it('un texto ya escrito vuelve con su valor', () => {
    const [web] = vistaSecciones(es, fuertes, marcas, { desarrolloWeb: { texto: 'Hice una tienda' } })
    expect(web?.preguntas.at(-1)).toMatchObject({ tipo: 'texto', valor: 'Hice una tienda' })
  })

  it('está lista cuando contestó cuánto tiempo lleva, y entonces trae un resumen; antes no', () => {
    const sin = vistaSecciones(es, fuertes, marcas, {})
    expect(sin.every((s) => !s.lista && s.resumen === '')).toBe(true)
    const [web] = vistaSecciones(es, fuertes, marcas, { desarrolloWeb: { tecnologias: ['react', 'node'], tiempo: 'tresACincoAnos' } })
    expect(web?.lista).toBe(true)
    expect(web?.resumen).toBe('React · Node.js · 3 a 5 años')
  })

  it('el resumen cuenta como mucho cuatro opciones de cada pregunta', () => {
    const [web] = vistaSecciones(es, fuertes, marcas, { desarrolloWeb: { tecnologias: ['htmlCss', 'javascript', 'react', 'vueAngular', 'node', 'python'], tiempo: 'masDeCincoAnos' } })
    expect(web?.resumen).toBe('HTML y CSS · JavaScript / TypeScript · React · Vue o Angular · Más de 5 años')
  })

  it('cambia con el idioma', () => {
    const [web] = vistaSecciones(en, fuertes, marcas, {})
    expect(web?.nombre).toBe('Web development')
    expect(web?.veces).toBe('it is my job')
    expect(web?.preguntas.find((p) => p.id === 'tiempo')?.titulo).toBe('How long have you been working with web development?')
  })

  it('sin habilidades no hay secciones', () => {
    expect(vistaSecciones(es, [], {}, {})).toEqual([])
  })
})
