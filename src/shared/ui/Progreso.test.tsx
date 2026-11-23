import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Progreso } from './Progreso'

describe('Progreso', () => {
  it('dice en qué paso va, con nombre accesible y valor', () => {
    render(<Progreso texto="Paso 1 de 2" actual={1} total={2} />)
    const barra = screen.getByRole('progressbar', { name: 'Paso 1 de 2' })
    expect(barra).toHaveAttribute('aria-valuenow', '1')
    expect(barra).toHaveAttribute('aria-valuemax', '2')
  })

  it('la parte llena de la barra crece con el paso', () => {
    const { rerender } = render(<Progreso texto="Paso 1 de 2" actual={1} total={2} />)
    expect(screen.getByRole('progressbar').firstElementChild).toHaveStyle({ width: '50%' })
    rerender(<Progreso texto="Paso 2 de 2" actual={2} total={2} />)
    expect(screen.getByRole('progressbar').firstElementChild).toHaveStyle({ width: '100%' })
  })
})
