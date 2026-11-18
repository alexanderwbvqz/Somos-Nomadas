import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DiagramaAreas } from './DiagramaAreas'

const textos = {
  descripcion: 'Las cuatro áreas se superponen',
  pie: 'Cuatro áreas, un equipo completo.',
  tecnologia: 'Tecnología',
  marketing: 'Marketing & Ventas',
  operaciones: 'Operaciones',
  finanzas: 'Finanzas',
  equipo: 'Equipo',
  roles: {
    tecnologia: 'construye el producto',
    marketing: 'lo hace llegar a los clientes',
    operaciones: 'hace que todo funcione',
    finanzas: 'cuida el dinero',
  },
}

describe('DiagramaAreas', () => {
  it('muestra el pie general y cuatro áreas como botones sin pulsar', () => {
    render(<DiagramaAreas textos={textos} />)
    expect(screen.getByText('Cuatro áreas, un equipo completo.')).toBeInTheDocument()
    for (const nombre of ['Tecnología', 'Marketing & Ventas', 'Operaciones', 'Finanzas']) {
      expect(screen.getByRole('button', { name: nombre })).toHaveAttribute('aria-pressed', 'false')
    }
  })

  it('al pulsar un área muestra lo que aporta y al volver a pulsar la suelta', async () => {
    render(<DiagramaAreas textos={textos} />)
    const area = screen.getByRole('button', { name: 'Finanzas' })

    await userEvent.click(area)
    expect(area).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/cuida el dinero/)).toBeInTheDocument()

    await userEvent.click(area)
    expect(area).toHaveAttribute('aria-pressed', 'false')
  })

  it('se puede activar con el teclado', async () => {
    render(<DiagramaAreas textos={textos} />)
    const area = screen.getByRole('button', { name: 'Tecnología' })
    area.focus()
    await userEvent.keyboard('{Enter}')
    expect(area).toHaveAttribute('aria-pressed', 'true')
  })
})
