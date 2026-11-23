import { describe, expect, it } from 'vitest'
import { en } from '../../language/en'
import { es } from '../../language/es'
import { vistaSugerencias } from './vistaSugerencias'

const sugerencias = [
  { tarea: 'interfacesWeb', nivel: 4, fuente: 'pdf' },
  { tarea: 'publicarProducto', nivel: 3, fuente: 'web' },
] as const

describe('vistaSugerencias', () => {
  it('pone el nombre de la tarea, el de la fuente y el nivel en el idioma, y conserva el orden', () => {
    expect(vistaSugerencias([...sugerencias], es.escritas)).toEqual([
      { tarea: 'interfacesWeb', titulo: 'Crear interfaces web', fuente: 'Tu PDF', nivel: 4, nivelTexto: 'Nivel estimado 4 de 5' },
      { tarea: 'publicarProducto', titulo: 'Lanzar un producto digital', fuente: 'Tu web', nivel: 3, nivelTexto: 'Nivel estimado 3 de 5' },
    ])
  })

  it('cambia con el idioma', () => {
    expect(vistaSugerencias([...sugerencias], en.escritas)[0]).toMatchObject({ titulo: 'Build web interfaces', fuente: 'Your PDF' })
  })

  it('sin sugerencias no hay filas', () => {
    expect(vistaSugerencias([], es.escritas)).toEqual([])
  })
})
