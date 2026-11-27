import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// La marca la añade la plantilla del título en el layout («Crear cuenta | Somos Nómadas»). Si un módulo la vuelve a
// escribir en su título, la pestaña diría «Crear cuenta | Nómadas | Somos Nómadas».
const MODULOS = join(process.cwd(), 'src/modules')

function textosDeIdioma(): { archivo: string; contenido: string }[] {
  return readdirSync(MODULOS).flatMap((modulo) => {
    const carpeta = join(MODULOS, modulo, 'language')
    let archivos: string[]
    try {
      archivos = readdirSync(carpeta)
    } catch {
      return []
    }
    return archivos
      .filter((nombre) => /^(es|en|pt)\.ts$/.test(nombre))
      .map((nombre) => ({ archivo: `${modulo}/language/${nombre}`, contenido: readFileSync(join(carpeta, nombre), 'utf-8') }))
  })
}

describe('títulos de las páginas', () => {
  it('ningún texto de idioma termina en «| Nómadas» ni en «| Somos Nómadas»: la marca la pone el layout', () => {
    const archivos = textosDeIdioma()
    expect(archivos.length).toBeGreaterThan(20) // si cambia la estructura, este test no debe pasar sin mirar nada

    const conMarca = archivos.flatMap(({ archivo, contenido }) =>
      contenido
        .split('\n')
        .filter((linea) => /\|\s*(Somos )?Nómadas['`]/.test(linea))
        .map((linea) => `${archivo}: ${linea.trim()}`),
    )
    expect(conMarca).toEqual([])
  })
})
