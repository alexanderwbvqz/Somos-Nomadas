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

describe('idiomas de acceso', () => {
  it('en y pt tienen exactamente las claves de es', () => {
    expect(claves(en)).toEqual(claves(es))
    expect(claves(pt)).toEqual(claves(es))
  })
})

describe('el enlace de confirmación', () => {
  it('la pantalla dice que dura 24 horas, como el backend, en los tres idiomas', () => {
    for (const textos of [es, en, pt]) expect(textos.confirmacion.nota).toContain('24')
  })
})
