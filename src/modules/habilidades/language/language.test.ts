import { describe, expect, it } from 'vitest'
import { caminos } from '../domain/camino'
import { camposEnlace } from '../domain/material'
import { tareas } from '../domain/tarea'
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

  it('cada idioma tiene un texto para cada camino, cada campo de enlace y cada tarea del dominio', () => {
    for (const textos of [es, en, pt]) {
      expect(Object.keys(textos.inicio.caminos).sort()).toEqual([...caminos].sort())
      expect(Object.keys(textos.escritas.enlaces).sort()).toEqual([...camposEnlace].sort())
      expect(Object.keys(textos.escritas.tareas).sort()).toEqual([...tareas].sort())
    }
  })

  it('los saludos con nombre llevan {nombre} en todos los idiomas', () => {
    for (const textos of [es, en, pt]) expect(textos.inicio.saludo).toContain('{nombre}')
  })

  it('los textos con variables las llevan en todos los idiomas', () => {
    for (const textos of [es, en, pt]) {
      expect(textos.comun.paso).toContain('{actual}')
      expect(textos.comun.paso).toContain('{total}')
      expect(textos.escritas.archivo.ayuda).toContain('{max}')
      expect(textos.escritas.errores.archivoGrande).toContain('{max}')
      expect(textos.escritas.revision.nivel).toContain('{nivel}')
      expect(textos.escritas.revision.contador).toContain('{n}')
      expect(textos.escritas.revision.contador).toContain('{total}')
    }
  })
})
