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
  contacto: { texto: 'Contacto', href: 'https://wa.me/51973356545' },
  redes: [] as { nombre: string; href: string; icono: React.ReactNode }[],
  etiquetaRedes: 'Redes sociales',
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

  it('el enlace de contacto se abre en pestaña nueva sin dar acceso a la página de origen', () => {
    render(<Pie {...props} />)
    const contacto = screen.getByRole('link', { name: /Contacto/ })
    expect(contacto).toHaveAttribute('href', 'https://wa.me/51973356545')
    expect(contacto).toHaveAttribute('target', '_blank')
    expect(contacto).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('sin redes no muestra la lista de redes', () => {
    render(<Pie {...props} />)
    expect(screen.queryByRole('list', { name: 'Redes sociales' })).not.toBeInTheDocument()
  })

  it('con redes muestra un enlace por red, nombrado por la red', () => {
    render(
      <Pie
        {...props}
        redes={[
          { nombre: 'Instagram', href: 'https://instagram.com/ejemplo', icono: <svg aria-hidden="true" /> },
          { nombre: 'LinkedIn', href: 'https://linkedin.com/company/ejemplo', icono: <svg aria-hidden="true" /> },
        ]}
      />,
    )
    const lista = screen.getByRole('list', { name: 'Redes sociales' })
    expect(within(lista).getByRole('link', { name: 'Instagram' })).toHaveAttribute('href', 'https://instagram.com/ejemplo')
    expect(within(lista).getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('target', '_blank')
  })

  it('el aviso de privacidad enlaza a la política de datos, y están el copyright y el selector', () => {
    render(<Pie {...props} />)
    const enlaces = screen.getAllByRole('link', { name: 'política de datos' })
    expect(enlaces.some((enlace) => enlace.getAttribute('href') === '/es/politica-de-datos')).toBe(true)
    expect(screen.getByText('© 2026 Nómadas. Todos los derechos reservados.')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Idioma' })).toBeInTheDocument()
  })
})
