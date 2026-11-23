import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Progreso } from './Progreso'

describe('Progreso', () => {
  it('dice en qué paso va, con nombre accesible y valor', () => {
    render(<Progreso texto="Paso 2 de 6" actual={2} total={6} />)
    const barra = screen.getByRole('progressbar', { name: 'Paso 2 de 6' })
    expect(barra).toHaveAttribute('aria-valuenow', '2')
    expect(barra).toHaveAttribute('aria-valuemax', '6')
    expect(screen.getByText('Paso 2 de 6')).toBeInTheDocument()
  })

  it('tiene un tramo por paso y están llenos hasta el actual', () => {
    const { rerender } = render(<Progreso texto="Paso 1 de 6" actual={1} total={6} />)
    const tramos = () => [...screen.getByRole('progressbar').children].map((tramo) => tramo.getAttribute('data-lleno'))
    expect(tramos()).toEqual(['true', 'false', 'false', 'false', 'false', 'false'])
    rerender(<Progreso texto="Paso 4 de 6" actual={4} total={6} />)
    expect(tramos()).toEqual(['true', 'true', 'true', 'true', 'false', 'false'])
  })
})
