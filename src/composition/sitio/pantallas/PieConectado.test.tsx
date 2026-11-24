import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { redesSociales } from '@/modules/sitio/domain/contacto'
import { idiomas } from '@/shared/idiomas/idiomas'
import { PieConectado } from './PieConectado'

describe('PieConectado', () => {
  it('en español muestra los enlaces y el aviso de privacidad, sin la cifra de registrados', () => {
    render(<PieConectado idioma="es" />)
    expect(screen.queryByText(/personas registradas/)).not.toBeInTheDocument()
    expect(within(screen.getByRole('navigation', { name: 'Explorar' })).getByRole('link', { name: 'Directorio' })).toHaveAttribute('href', '/es/directorio')
    expect(within(screen.getByRole('navigation', { name: 'Ecosistema' })).getByRole('link', { name: 'Postular como aliado' })).toHaveAttribute('href', '/es/aliados/postular')
    expect(screen.getByText(/Usamos tus datos personales solo para conectar fundadores entre sí/)).toBeInTheDocument()
  })

  it('Ecosistema tiene solo la red de aliados y postular como aliado: los mentores ya están dentro de la red', () => {
    render(<PieConectado idioma="es" />)
    const ecosistema = screen.getByRole('navigation', { name: 'Ecosistema' })
    const enlaces = within(ecosistema).getAllByRole('link')
    expect(enlaces.map((enlace) => enlace.textContent)).toEqual(['Red de aliados', 'Postular como aliado'])
    expect(enlaces.map((enlace) => enlace.getAttribute('href'))).toEqual(['/es/aliados', '/es/aliados/postular'])
    expect(within(ecosistema).queryByRole('link', { name: 'Mentores' })).not.toBeInTheDocument()
  })

  it('Contacto lleva a WhatsApp con el número de Nómadas y se traduce', () => {
    const { unmount } = render(<PieConectado idioma="es" />)
    expect(screen.getByRole('link', { name: /Contacto/ })).toHaveAttribute('href', 'https://wa.me/51973356545')
    unmount()
    render(<PieConectado idioma="en" />)
    expect(screen.getByRole('link', { name: /Contact/ })).toHaveAttribute('href', 'https://wa.me/51973356545')
  })

  it('muestra un enlace por cada red social definida en el dominio, nombrado por la red', () => {
    render(<PieConectado idioma="es" />)
    const lista = screen.getByRole('list', { name: 'Redes sociales' })
    expect(within(lista).getAllByRole('link')).toHaveLength(redesSociales.length)
    const instagram = redesSociales.find((red) => red.tipo === 'instagram')
    expect(within(lista).getByRole('link', { name: 'Instagram' })).toHaveAttribute('href', instagram?.href)
    expect(within(lista).getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('target', '_blank')
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
