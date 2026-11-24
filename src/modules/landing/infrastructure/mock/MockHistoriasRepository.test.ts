import { describe, expect, it } from 'vitest'
import { historiaPublicable } from '../../domain/historias'
import { MockHistoriasRepository } from './MockHistoriasRepository'

const ANIO = 2026
const idiomas = ['es', 'en', 'pt']

describe('MockHistoriasRepository', () => {
  it.each(idiomas)('en %s trae las mismas historias, con las mismas claves y en el mismo orden', async (idioma) => {
    const claves = (await new MockHistoriasRepository().obtener(idioma)).map((historia) => historia.clave)
    const enEspanol = (await new MockHistoriasRepository().obtener('es')).map((historia) => historia.clave)
    expect(claves).toEqual(enEspanol)
    expect(claves.length).toBeGreaterThanOrEqual(3)
  })

  it.each(idiomas)('en %s las completas se pueden publicar: tienen fuente, texto y personas', async (idioma) => {
    const historias = await new MockHistoriasRepository().obtener(idioma)
    for (const clave of ['apple', 'airbnb', 'nike']) {
      const historia = historias.find((h) => h.clave === clave)
      expect(historia, clave).toBeDefined()
      expect(historiaPublicable(historia!, ANIO), `${clave} en ${idioma}`).toBe(true)
    }
  })

  it('las que faltan por escribir llegan, pero no se pueden publicar', async () => {
    const historias = await new MockHistoriasRepository().obtener('es')
    const incompletas = historias.filter((historia) => !historiaPublicable(historia, ANIO))
    expect(incompletas.map((h) => h.clave)).toEqual(['mercadolibre', 'rappi'])
  })

  it('cada idioma trae sus textos, no los del español', async () => {
    const [es, en, pt] = await Promise.all(idiomas.map((idioma) => new MockHistoriasRepository().obtener(idioma)))
    const apple = (historias: typeof es) => historias!.find((h) => h.clave === 'apple')!
    expect(apple(es).combinacion).toBe('Ingeniería + Ventas')
    expect(apple(en).combinacion).toBe('Engineering + Sales')
    expect(apple(pt).combinacion).toBe('Engenharia + Vendas')
    // lo que no cambia con el idioma
    expect(apple(en).anio).toBe(apple(es).anio)
    expect(apple(pt).personas.map((p) => p.iniciales)).toEqual(apple(es).personas.map((p) => p.iniciales))
  })

  it('si no hay textos en ese idioma, devuelve los del español', async () => {
    expect(await new MockHistoriasRepository().obtener('fr')).toEqual(await new MockHistoriasRepository().obtener('es'))
  })

  it('devuelve copias: quien las lea no puede cambiar lo que hay', async () => {
    const primera = await new MockHistoriasRepository().obtener('es')
    primera[0]!.nombre = 'Otra'
    primera[0]!.personas.pop()
    const segunda = await new MockHistoriasRepository().obtener('es')
    expect(segunda[0]!.nombre).toBe('Apple')
    expect(segunda[0]!.personas).toHaveLength(2)
  })
})
