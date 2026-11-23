import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProgresoPaso } from './ProgresoPaso'

describe('ProgresoPaso', () => {
  it('dice en qué paso va y cómo se llama, con nombre accesible y valor', () => {
    render(<ProgresoPaso texto="Paso 2 de 5" nombre="Qué has hecho" actual={2} total={5} />)
    const barra = screen.getByRole('progressbar', { name: 'Paso 2 de 5' })
    expect(barra).toHaveAttribute('aria-valuenow', '2')
    expect(barra).toHaveAttribute('aria-valuemax', '5')
    expect(screen.getByText('Paso 2 de 5')).toBeInTheDocument()
    expect(screen.getByText('Qué has hecho')).toBeInTheDocument()
  })

  it('tiene un tramo por paso, llenos hasta el actual, y marca cuál es el actual', () => {
    const { rerender } = render(<ProgresoPaso texto="Paso 1 de 5" nombre="a" actual={1} total={5} />)
    const llenos = () => [...screen.getByRole('progressbar').children].map((tramo) => tramo.getAttribute('data-lleno'))
    const actual = () => [...screen.getByRole('progressbar').children].map((tramo) => tramo.getAttribute('data-actual'))
    expect(llenos()).toEqual(['true', 'false', 'false', 'false', 'false'])
    expect(actual()).toEqual(['true', 'false', 'false', 'false', 'false'])
    rerender(<ProgresoPaso texto="Paso 4 de 5" nombre="a" actual={4} total={5} />)
    expect(llenos()).toEqual(['true', 'true', 'true', 'true', 'false'])
    expect(actual()).toEqual(['false', 'false', 'false', 'true', 'false'])
  })
})
