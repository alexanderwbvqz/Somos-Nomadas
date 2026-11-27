import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { paletaImagenes } from '@/shared/styles/colores/paletaImagenes'
import { ImagenCompartir } from './ImagenCompartir'

const props = {
  marca: 'Somos Nómadas',
  fraseInicio: 'Los grandes proyectos nacen cuando encuentran a las',
  fraseResaltada: 'personas correctas.',
  dominio: 'somosnomadas.app',
  logo: 'data:image/svg+xml;base64,AAAA',
}

describe('ImagenCompartir', () => {
  it('dibuja el logo, la marca, la frase y el dominio', () => {
    const { container } = render(<ImagenCompartir {...props} />)

    expect(container.querySelector('img')?.getAttribute('src')).toBe(props.logo)
    expect(screen.getByText('Somos Nómadas')).toBeInTheDocument()
    expect(screen.getByText('somosnomadas.app')).toBeInTheDocument()
    // La frase va palabra a palabra (así se parte en líneas al dibujarla) y se lee entera, en orden
    const palabras = [...container.querySelectorAll('[data-palabra]')].map((p) => p.textContent)
    expect(palabras.join(' ')).toBe(`${props.fraseInicio} ${props.fraseResaltada}`)
  })

  it('la parte resaltada va en cursiva y en el color primario; el resto no', () => {
    const { container } = render(<ImagenCompartir {...props} />)
    const palabras = [...container.querySelectorAll<HTMLElement>('[data-palabra]')]
    const resaltadas = palabras.filter((p) => p.style.fontStyle === 'italic')

    expect(resaltadas.map((p) => p.textContent)).toEqual(['personas', 'correctas.'])
    for (const p of resaltadas) expect(p.style.color).toBe(colorEnDom(paletaImagenes.primario))
    for (const p of palabras.filter((p) => !resaltadas.includes(p))) expect(p.style.fontStyle).not.toBe('italic')
  })

  it('mide 1200 × 630, con el fondo y el texto de la web', () => {
    const { container } = render(<ImagenCompartir {...props} />)
    const tarjeta = container.firstElementChild as HTMLElement

    expect([tarjeta.style.width, tarjeta.style.height]).toEqual(['1200px', '630px'])
    expect(tarjeta.style.backgroundColor).toBe(colorEnDom(paletaImagenes.fondo))
    expect(tarjeta.style.color).toBe(colorEnDom(paletaImagenes.texto))
  })
})

/** El DOM de pruebas devuelve los colores como rgb() */
function colorEnDom(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16))
  return `rgb(${r}, ${g}, ${b})`
}
