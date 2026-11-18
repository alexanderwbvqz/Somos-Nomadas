import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AliadosView } from './AliadosView'

describe('AliadosView', () => {
  it('muestra el hero con el titular como encabezado principal', () => {
    render(<AliadosView hero={{ etiqueta: 'Aliados', titulo: 'Red de aliados', parrafo: 'Texto.' }} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Red de aliados' })).toBeInTheDocument()
    expect(screen.getByText('Aliados')).toBeInTheDocument()
  })
})
