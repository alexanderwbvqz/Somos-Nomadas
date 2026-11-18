import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EventosView } from './EventosView'

describe('EventosView', () => {
  it('muestra el hero con el titular como encabezado principal', () => {
    render(<EventosView hero={{ etiqueta: 'Eventos', titulo: 'Próximos eventos', parrafo: 'Texto.' }} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Próximos eventos' })).toBeInTheDocument()
    expect(screen.getByText('Eventos')).toBeInTheDocument()
  })
})
