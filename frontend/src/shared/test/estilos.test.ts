// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

// Vigila las reglas de estilo de CLAUDE.md (sección 5): los colores solo salen de los tokens, y toda animación respeta
// prefers-reduced-motion. Lee los archivos del proyecto; no hace falta compilar nada.

const raiz = join(process.cwd(), 'src')

function archivos(directorio: string): string[] {
  return readdirSync(directorio, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = join(directorio, entrada.name)
    if (entrada.isDirectory()) return archivos(ruta)
    return /\.(ts|tsx|css)$/.test(entrada.name) ? [ruta] : []
  })
}

const nombre = (ruta: string) => relative(raiz, ruta).replaceAll('\\', '/')

describe('colores', () => {
  // Lo que no puede aparecer fuera de shared/styles/colores/: hexadecimales, rgb(), hsl() y la paleta por defecto de Tailwind
  const prohibido =
    /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\b(?:bg|text|border|ring|fill|stroke|from|via|to|outline|divide|decoration|shadow)-(?:white|black|gray|slate|zinc|neutral|red|blue|green|yellow|orange|amber|lime|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose|stone)(?:-\d+)?\b/

  it('ningún archivo usa colores sueltos fuera de los tokens', () => {
    const infractores = archivos(raiz)
      .filter((ruta) => !nombre(ruta).startsWith('shared/styles/colores/') && !/\.test\.(ts|tsx)$/.test(ruta))
      .flatMap((ruta) =>
        readFileSync(ruta, 'utf-8')
          .split('\n')
          .map((linea, indice) => ({ archivo: nombre(ruta), linea: indice + 1, texto: linea }))
          .filter(({ texto }) => prohibido.test(texto) && !texto.trim().startsWith('//') && !texto.trim().startsWith('*')),
      )
      .map(({ archivo, linea }) => `${archivo}:${linea}`)
    expect(infractores).toEqual([])
  })

  it('la regla reconoce los colores sueltos que debe prohibir', () => {
    for (const suelto of ['#fff', 'bg-[#ff0000]', 'rgb(0 0 0)', 'rgba(0,0,0,.5)', 'hsl(var(--x))', 'bg-white', 'text-gray-500', 'border-red-600', 'fill-blue-400']) {
      expect(prohibido.test(suelto), suelto).toBe(true)
    }
    for (const token of ['bg-fondo', 'text-texto-tenue', 'border-borde-campo', 'fill-degradado-amarillo', 'bg-primario/55', 'text-fantasma']) {
      expect(prohibido.test(token), token).toBe(false)
    }
  })
})

describe('tonos tenues', () => {
  // Un `opacity-NN` suelto (sin variante como hover: o disabled:) sobre un texto no cuenta como token: el contraste no se comprueba.
  // opacity-0 y opacity-100 quedan permitidos (aparecer y desaparecer).
  const opacidadSuelta = /(?<![\w:-])opacity-(?!(?:0|100)\b)\d+/

  // Lo que se queda a propósito, con su razón
  const permitidos = new Set([
    'modules/aliados/presentation/ui/VistaPreviaPerfil.tsx', // marcadores de ejemplo de una vista previa vacía
    'modules/aliados/presentation/ui/FilaVistaPrevia.tsx', // ídem
    'modules/landing/presentation/ui/DiagramaAreas.tsx', // estado: el área que no está activa se apaga
    'modules/sitio/presentation/BarraCuenta.tsx', // estado: sección que todavía no existe
  ])

  it('ningún texto usa opacity-NN para verse tenue: usa text-texto-suave, text-texto-tenue, text-fondo-suave o text-fondo-tenue', () => {
    const infractores = archivos(raiz)
      .filter((ruta) => ruta.endsWith('.tsx') && !/\.test\.tsx$/.test(ruta) && !permitidos.has(nombre(ruta)))
      .flatMap((ruta) =>
        readFileSync(ruta, 'utf-8')
          .split(String.fromCharCode(10))
          .map((linea, indice) => ({ archivo: nombre(ruta), linea: indice + 1, texto: linea }))
          .filter(({ texto }) => opacidadSuelta.test(texto)),
      )
      .map(({ archivo, linea }) => `${archivo}:${linea}`)
    expect(infractores).toEqual([])
  })

  it('la regla reconoce el opacity suelto y deja pasar los estados y el aparecer o desaparecer', () => {
    for (const suelto of ['opacity-60', 'text-nota opacity-75', "'opacity-35'", 'italic opacity-65']) {
      expect(opacidadSuelta.test(suelto), suelto).toBe(true)
    }
    for (const estado of ['disabled:opacity-60', 'peer-disabled:opacity-40', 'hover:opacity-100', 'opacity-0', 'opacity-100', 'text-texto-tenue']) {
      expect(opacidadSuelta.test(estado), estado).toBe(false)
    }
  })

  it('los tokens de texto tenue existen, también los de sobre fondo oscuro', () => {
    const colores = readFileSync(join(raiz, 'shared/styles/colores/colores.css'), 'utf-8')
    for (const token of ['--color-texto-suave', '--color-texto-tenue', '--color-fondo-suave', '--color-fondo-tenue']) {
      expect(colores, token).toContain(`${token}:`)
    }
  })
})

describe('animaciones', () => {
  const css = readFileSync(join(raiz, 'shared/styles/animaciones/animaciones.css'), 'utf-8')

  // Cada `@utility nombre { … }` con su cuerpo, contando las llaves
  function utilidades(): { nombre: string; cuerpo: string }[] {
    const resultado: { nombre: string; cuerpo: string }[] = []
    const inicio = /@utility ([\w-]+) \{/g
    for (let coincidencia = inicio.exec(css); coincidencia; coincidencia = inicio.exec(css)) {
      let profundidad = 1
      let fin = inicio.lastIndex
      while (profundidad > 0 && fin < css.length) {
        if (css[fin] === '{') profundidad++
        if (css[fin] === '}') profundidad--
        fin++
      }
      resultado.push({ nombre: coincidencia[1]!, cuerpo: css.slice(inicio.lastIndex, fin - 1) })
    }
    return resultado
  }

  it('lee las utilidades del archivo', () => {
    expect(utilidades().map((u) => u.nombre)).toEqual(expect.arrayContaining(['flotar', 'transicion-suave', 'franja-pista', 'girar', 'transicion-color', 'despliegue', 'relleno-progreso']))
  })

  it('toda utilidad que anima o hace una transición respeta prefers-reduced-motion', () => {
    const sinRespetar = utilidades()
      .filter(({ cuerpo }) => /\b(?:animation|transition)\s*:/.test(cuerpo))
      .filter(({ cuerpo }) => !/@media \(prefers-reduced-motion: reduce\)/.test(cuerpo))
      .map(({ nombre: clave }) => clave)
    expect(sinRespetar).toEqual([])
  })

  it('con movimiento reducido, esa utilidad quita la animación o la transición', () => {
    const mal = utilidades()
      .filter(({ cuerpo }) => /@media \(prefers-reduced-motion: reduce\)/.test(cuerpo))
      .filter(({ cuerpo }) => {
        const reducido = cuerpo.slice(cuerpo.indexOf('@media (prefers-reduced-motion: reduce)'))
        const anima = /\banimation\s*:/.test(cuerpo.slice(0, cuerpo.indexOf('@media')))
        const transiciona = /\btransition\s*:/.test(cuerpo.slice(0, cuerpo.indexOf('@media')))
        return (anima && !/animation:\s*none/.test(reducido)) || (transiciona && !/transition:\s*none/.test(reducido))
      })
      .map(({ nombre: clave }) => clave)
    expect(mal).toEqual([])
  })
})
