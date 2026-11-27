import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { paletaImagenes } from './paletaImagenes'

// Los colores de las imágenes que dibuja el servidor (que no puede usar clases ni variables CSS) son los mismos
// tokens de colores.css: si uno cambia allí, este test obliga a cambiarlo aquí
const css = readFileSync(join(process.cwd(), 'src/shared/styles/colores/colores.css'), 'utf-8')
const token = (nombre: string) => css.match(new RegExp(`--color-${nombre}:\\s*(#[0-9a-fA-F]{6});`))?.[1]?.toLowerCase()

describe('paletaImagenes', () => {
  it.each([
    ['fondo', 'fondo'],
    ['texto', 'texto'],
    ['textoSuave', 'texto-suave'],
    ['primario', 'primario'],
  ] as const)('%s es el token --color-%s de colores.css', (clave, nombre) => {
    expect(token(nombre)).toBeDefined()
    expect(paletaImagenes[clave]).toBe(token(nombre))
  })
})
