import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BarraCuenta, type BarraCuentaProps } from './BarraCuenta'

const props: BarraCuentaProps = {
  logoSrc: '/logo/x.svg',
  logoAlt: 'Marca',
  hrefInicio: '/es',
  etiquetaNavegacion: 'Secciones de tu cuenta',
  enlaces: [
    { id: 'descubrir', etiqueta: 'Descubrir' },
    { id: 'conversaciones', etiqueta: 'Conversaciones' },
    { id: 'guardados', etiqueta: 'Guardados' },
  ],
  pronto: 'Pronto',
  perfil: { etiqueta: 'Mi perfil', href: '/es/perfil', iniciales: 'AT' },
}

describe('BarraCuenta', () => {
  it('lleva el logo como enlace al inicio y el perfil a la derecha', () => {
    render(<BarraCuenta {...props} />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Marca' })).toHaveAttribute('href', '/es')
    expect(screen.getByRole('link', { name: 'Mi perfil' })).toHaveAttribute('href', '/es/perfil')
  })

  it('las iniciales adornan el perfil pero no cambian su nombre accesible', () => {
    render(<BarraCuenta {...props} />)
    const enlace = screen.getByRole('link', { name: 'Mi perfil' })
    expect(within(enlace).getByText('AT')).toHaveAttribute('aria-hidden', 'true')
  })

  it('sin iniciales no se dibuja el círculo', () => {
    render(<BarraCuenta {...props} perfil={{ ...props.perfil, iniciales: '' }} />)
    const enlace = screen.getByRole('link', { name: 'Mi perfil' })
    expect(enlace.querySelector('[aria-hidden="true"]')).toBeNull()
    expect(enlace.children).toHaveLength(0)
  })

  it('las secciones que todavía no existen se ven apagadas, con «Pronto», y no son enlaces', () => {
    render(<BarraCuenta {...props} />)
    const lista = within(screen.getByRole('navigation', { name: 'Secciones de tu cuenta' })).getByRole('list')
    const secciones = within(lista).getAllByRole('listitem')
    expect(secciones).toHaveLength(3)
    for (const seccion of secciones) {
      expect(within(seccion).queryByRole('link')).not.toBeInTheDocument()
      expect(within(seccion).getByText('Pronto')).toBeInTheDocument()
      expect(seccion.querySelector('[aria-disabled="true"]')).not.toBeNull()
    }
    // El único enlace dentro de la navegación sería una sección que ya existe; aquí no hay ninguna
    expect(within(screen.getByRole('navigation')).queryAllByRole('link')).toHaveLength(0)
  })

  it('una sección que ya existe es un enlace, sin insignia, y la activa lo dice con aria-current', () => {
    render(
      <BarraCuenta
        {...props}
        enlaces={[{ id: 'descubrir', etiqueta: 'Descubrir', href: '/es/descubrir', activo: true }, { id: 'guardados', etiqueta: 'Guardados', href: '/es/guardados' }]}
      />,
    )
    const activa = screen.getByRole('link', { name: 'Descubrir' })
    expect(activa).toHaveAttribute('href', '/es/descubrir')
    expect(activa).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Guardados' })).not.toHaveAttribute('aria-current')
    expect(screen.queryByText('Pronto')).not.toBeInTheDocument()
  })

  it('el perfil activo lo dice con aria-current, y si no lo es no', () => {
    const { rerender } = render(<BarraCuenta {...props} perfil={{ ...props.perfil, activo: true }} />)
    expect(screen.getByRole('link', { name: 'Mi perfil' })).toHaveAttribute('aria-current', 'page')
    rerender(<BarraCuenta {...props} />)
    expect(screen.getByRole('link', { name: 'Mi perfil' })).not.toHaveAttribute('aria-current')
  })
})
