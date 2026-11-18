import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { idiomas } from '@/shared/idiomas/idiomas'
import { AliadosConectado } from './AliadosConectado'

describe('AliadosConectado', () => {
  it.each([
    ['es', 'Red de aliados'],
    ['en', 'Ally network'],
    ['pt', 'Rede de aliados'],
  ] as const)('en %s muestra el titular "%s"', (idioma, titulo) => {
    render(<AliadosConectado idioma={idioma} />)
    expect(screen.getByRole('heading', { level: 1, name: titulo })).toBeInTheDocument()
  })

  it.each(idiomas)('en %s no queda ninguna plantilla {…} sin rellenar', (idioma) => {
    const { container } = render(<AliadosConectado idioma={idioma} />)
    expect(container.textContent).not.toMatch(/\{\w+\}/)
  })
})
