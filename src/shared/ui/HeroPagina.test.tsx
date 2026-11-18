import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HeroPagina } from './HeroPagina'

describe('HeroPagina', () => {
  it('muestra el titular como encabezado principal, con la etiqueta y el párrafo', () => {
    render(<HeroPagina etiqueta="Eventos" titulo="Próximos eventos" parrafo="Texto introductorio." />)
    expect(screen.getByRole('heading', { level: 1, name: 'Próximos eventos' })).toBeInTheDocument()
    expect(screen.getByText('Eventos')).toBeInTheDocument()
    expect(screen.getByText('Texto introductorio.')).toBeInTheDocument()
  })

  it('la sección se nombra por su titular', () => {
    render(<HeroPagina etiqueta="Eventos" titulo="Próximos eventos" parrafo="Texto." />)
    expect(screen.getByRole('region', { name: 'Próximos eventos' })).toBeInTheDocument()
  })
})
