import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { idiomas } from '@/shared/idiomas/idiomas'
import { PieConectado } from './PieConectado'

describe('PieConectado', () => {
  it('en español muestra la insignia con la cifra de registrados, los enlaces y el aviso de privacidad', () => {
    render(<PieConectado idioma="es" />)
    expect(screen.getByText('75+ personas registradas')).toBeInTheDocument()
    expect(within(screen.getByRole('navigation', { name: 'Explorar' })).getByRole('link', { name: 'Directorio' })).toHaveAttribute('href', '/es/directorio')
    expect(within(screen.getByRole('navigation', { name: 'Ecosistema' })).getByRole('link', { name: 'Postular como aliado' })).toHaveAttribute('href', '/es/aliados/postular')
    expect(screen.getByText(/Usamos tus datos personales solo para conectar fundadores entre sí/)).toBeInTheDocument()
  })

  it('Contacto lleva a WhatsApp con el número de Nómadas y se traduce', () => {
    const { unmount } = render(<PieConectado idioma="es" />)
    expect(screen.getByRole('link', { name: /Contacto/ })).toHaveAttribute('href', 'https://wa.me/51973356545')
    unmount()
    render(<PieConectado idioma="en" />)
    expect(screen.getByRole('link', { name: /Contact/ })).toHaveAttribute('href', 'https://wa.me/51973356545')
  })

  it('mientras no haya enlaces de redes sociales no se muestran iconos', () => {
    render(<PieConectado idioma="es" />)
    expect(screen.queryByRole('list', { name: 'Redes sociales' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Instagram' })).not.toBeInTheDocument()
  })

  it('el copyright lleva el año actual', () => {
    render(<PieConectado idioma="es" />)
    expect(screen.getByText(`© ${new Date().getFullYear()} Nómadas. Todos los derechos reservados.`)).toBeInTheDocument()
  })

  it('ofrece los otros dos idiomas como enlaces y marca el actual', () => {
    render(<PieConectado idioma="es" />)
    const selector = screen.getByRole('navigation', { name: 'Idioma' })
    expect(within(selector).getByText('Español')).toHaveAttribute('aria-current', 'true')
    expect(within(selector).getByRole('link', { name: 'English' })).toHaveAttribute('href', '/en')
    expect(within(selector).getByRole('link', { name: 'Português' })).toHaveAttribute('href', '/pt')
  })

  it.each(idiomas)('en %s no queda ninguna plantilla {…} sin rellenar', (idioma) => {
    const { container } = render(<PieConectado idioma={idioma} />)
    expect(container.textContent).not.toMatch(/\{\w+\}/)
  })
})
