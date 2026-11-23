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

  it('muestra a la derecha lo que le pase cada pantalla', () => {
    render(<BarraEnfocada {...props} derecha={<p>Paso 1 de 2</p>} />)
    expect(screen.getByText('Paso 1 de 2')).toBeInTheDocument()
  })
})
