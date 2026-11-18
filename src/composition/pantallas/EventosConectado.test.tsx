import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { idiomas } from '@/shared/idiomas/idiomas'
import { EventosConectado } from './EventosConectado'

describe('EventosConectado', () => {
  it.each([
    ['es', 'Próximos eventos'],
    ['en', 'Upcoming events'],
    ['pt', 'Próximos eventos'],
  ] as const)('en %s muestra el titular "%s"', (idioma, titulo) => {
    render(<EventosConectado idioma={idioma} />)
    expect(screen.getByRole('heading', { level: 1, name: titulo })).toBeInTheDocument()
  })

  it.each(idiomas)('en %s no queda ninguna plantilla {…} sin rellenar', (idioma) => {
    const { container } = render(<EventosConectado idioma={idioma} />)
    expect(container.textContent).not.toMatch(/\{\w+\}/)
  })
})
