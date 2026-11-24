import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Boton } from './Boton'

describe('Boton', () => {
  it('es un botón con su texto como nombre accesible', () => {
    render(<Boton alPulsar={() => {}}>Ver más eventos</Boton>)
    expect(screen.getByRole('button', { name: 'Ver más eventos' })).toBeInTheDocument()
  })

  it('avisa al pulsarlo', async () => {
    const alPulsar = vi.fn()
    render(<Boton alPulsar={alPulsar}>Ver más</Boton>)
    await userEvent.click(screen.getByRole('button', { name: 'Ver más' }))
    expect(alPulsar).toHaveBeenCalledTimes(1)
  })
})
