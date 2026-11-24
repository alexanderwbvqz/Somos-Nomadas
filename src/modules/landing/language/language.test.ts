import { describe, expect, it } from 'vitest'
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

describe('idiomas de landing', () => {
  it('en y pt tienen exactamente las claves de es', () => {
    expect(claves(en)).toEqual(claves(es))
    expect(claves(pt)).toEqual(claves(es))
  })

  it('la seccion de historias tiene todos sus textos escritos en cada idioma', () => {
    for (const textos of [es, en, pt]) {
      const valores = claves(textos.historias).map((clave) => clave.split('.').reduce<unknown>((valor, parte) => (valor as Record<string, unknown>)[parte], textos.historias))
      expect(valores.length).toBeGreaterThanOrEqual(10)
      for (const valor of valores) expect((valor as string).trim()).not.toBe('')
    }
  })

  it('el titulo de las historias no repite el del resto de la landing', () => {
    for (const textos of [es, en, pt]) {
      const otros = [textos.hero.tituloResaltado, textos.match.tituloResaltado, textos.pilares.tituloResaltado, textos.aliados.tituloResaltado]
      expect(otros).not.toContain(textos.historias.tituloResaltado)
    }
  })
})
