import { describe, expect, it } from 'vitest'
import { PAISES } from '../domain/cuenta'
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

describe('idiomas de acceso', () => {
  it('en y pt tienen exactamente las claves de es', () => {
    expect(claves(en)).toEqual(claves(es))
    expect(claves(pt)).toEqual(claves(es))
  })

  it('cada idioma nombra todos los países de la lista', () => {
    for (const textos of [es, en, pt]) expect(Object.keys(textos.paises).sort()).toEqual([...PAISES].sort())
  })
})
