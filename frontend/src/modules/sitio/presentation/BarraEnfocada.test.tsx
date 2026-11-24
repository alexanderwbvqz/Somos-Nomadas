import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BarraEnfocada } from './BarraEnfocada'

const props = { logoSrc: '/logo/x.svg', logoAlt: 'Marca', hrefInicio: '/es' }

describe('BarraEnfocada', () => {
  it('solo lleva el logo como enlace al inicio, sin navegación', () => {
    render(<BarraEnfocada {...props} />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Marca' })).toHaveAttribute('href', '/es')
    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('muestra en el centro y a la derecha lo que le pase cada pantalla', () => {
    render(<BarraEnfocada {...props} centro={<p>Paso 1 de 6</p>} derecha={<p>Saltar por ahora</p>} />)
    expect(screen.getByText('Paso 1 de 6')).toBeInTheDocument()
    expect(screen.getByText('Saltar por ahora')).toBeInTheDocument()
  })

  it('sin centro ni derecha no deja huecos vacíos', () => {
    const { container } = render(<BarraEnfocada {...props} />)
    expect(container.querySelectorAll('header > div > div')).toHaveLength(0)
  })
})
