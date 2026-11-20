import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BarraSuperior } from './BarraSuperior'

const props = {
  logoSrc: '/logo/x.svg',
  logoAlt: 'Marca',
  hrefInicio: '/es',
  etiquetaNavegacion: 'Principal',
  enlaces: [{ texto: 'Postular', href: '/es/registro' }],
}

describe('BarraSuperior', () => {
  it('muestra el logo como enlace al inicio y la navegación con nombre accesible', () => {
    render(<BarraSuperior {...props} />)
    expect(screen.getByRole('link', { name: 'Marca' })).toHaveAttribute('href', '/es')
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Postular/ })).toHaveAttribute('href', '/es/registro')
  })
})
