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
    for (const clave of ['apple', 'airbnb', 'nike', 'mercadolibre']) {
      const historia = historias.find((h) => h.clave === clave)
      expect(historia, clave).toBeDefined()
      expect(historiaPublicable(historia!, ANIO), `${clave} en ${idioma}`).toBe(true)
    }
  })

  it('la que falta por escribir llega, pero no se puede publicar', async () => {
    const historias = await new MockHistoriasRepository().obtener('es')
    const incompletas = historias.filter((historia) => !historiaPublicable(historia, ANIO))
    expect(incompletas.map((h) => h.clave)).toEqual(['rappi'])
  })

  describe('Mercado Libre', () => {
    const mercadoLibre = async (idioma: string) => (await new MockHistoriasRepository().obtener(idioma)).find((h) => h.clave === 'mercadolibre')!

    it('son dos personas, con su área y lo que aportó cada una según su cargo', async () => {
      const historia = await mercadoLibre('es')
      expect(historia.anio).toBe(1999)
      expect(historia.personas.map((p) => [p.nombre, p.area, p.aporte])).toEqual([
        ['Marcos Galperin', 'marketing', 'Plan de negocio y dirección'],
        ['Hernán Kazah', 'operaciones', 'Operaciones'],
      ])
    })

    it.each(idiomas)('en %s se apoya en dos fuentes: Stanford y el formulario de la SEC, con enlaces seguros', async (idioma) => {
      const { fuentes } = await mercadoLibre(idioma)
      expect(fuentes.map((f) => new URL(f.href).hostname)).toEqual(['www.gsb.stanford.edu', 'www.sec.gov'])
      expect(fuentes.map((f) => f.texto)).toEqual([expect.stringContaining('Stanford'), expect.stringContaining('SEC')])
    })

    it.each(idiomas)('en %s cuenta de dónde se conocían, el plan de 1999 y quién era cada uno, sin afirmar más de lo que dicen las fuentes', async (idioma) => {
      const { parrafos } = await mercadoLibre(idioma)
      const texto = parrafos.join(' ')
      expect(parrafos).toHaveLength(3)
      expect(texto).toContain('Stanford')
      expect(texto).toContain('1999')
      expect(texto).toContain('Argentina')
      // Dato que no consta en las fuentes: no se afirma cómo ni cuándo empezó su amistad
      expect(texto).not.toMatch(/amig|friend/i)
    })
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
