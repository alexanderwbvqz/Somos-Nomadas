import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Pie } from './Pie'

const props = {
  logoSrc: '/logo/x.svg',
  logoAlt: 'Marca',
  hrefInicio: '/es',
  descripcion: 'Descripción de la comunidad.',
  insignia: '75+ personas registradas',
  columnas: [
    { id: 'explorar', titulo: 'Explorar', enlaces: [{ texto: 'Directorio', href: '/es/directorio' }] },
    { id: 'privacidad', titulo: 'Privacidad', enlaces: [{ texto: 'Política de datos', href: '/es/politica-de-datos' }] },
  ],
  aviso: { antes: 'Usamos tus datos solo para conectar. Más información en la', textoEnlace: 'política de datos', despues: '.', href: '/es/politica-de-datos' },
  copyright: '© 2026 Nómadas. Todos los derechos reservados.',
  selectorIdioma: <nav aria-label="Idioma">selector</nav>,
}

describe('Pie', () => {
  it('muestra el logo como enlace al inicio, la descripción y la insignia', () => {
    render(<Pie {...props} />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Marca' })).toHaveAttribute('href', '/es')
    expect(screen.getByText('Descripción de la comunidad.')).toBeInTheDocument()
    expect(screen.getByText('75+ personas registradas')).toBeInTheDocument()
  })

  it('cada columna es una navegación con su título como nombre accesible', () => {
    render(<Pie {...props} />)
    const explorar = screen.getByRole('navigation', { name: 'Explorar' })
    expect(within(explorar).getByRole('link', { name: 'Directorio' })).toHaveAttribute('href', '/es/directorio')
    expect(screen.getByRole('navigation', { name: 'Privacidad' })).toBeInTheDocument()
  })

  it('el aviso de privacidad enlaza a la política de datos, y están el copyright y el selector', () => {
    render(<Pie {...props} />)
    const enlaces = screen.getAllByRole('link', { name: 'política de datos' })
    expect(enlaces.some((enlace) => enlace.getAttribute('href') === '/es/politica-de-datos')).toBe(true)
    expect(screen.getByText('© 2026 Nómadas. Todos los derechos reservados.')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Idioma' })).toBeInTheDocument()
  })
})
