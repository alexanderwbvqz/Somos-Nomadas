import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FranjaLogos } from './FranjaLogos'

describe('FranjaLogos', () => {
  it('no muestra nada si no hay elementos', () => {
    const { container } = render(<FranjaLogos elementos={[]} etiqueta="Aliados" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('lista cada elemento una vez para lectores de pantalla (la copia queda oculta)', () => {
    render(<FranjaLogos elementos={[{ nombre: 'Uno' }, { nombre: 'Dos' }]} etiqueta="Aliados" />)
    expect(screen.getByRole('group', { name: 'Aliados' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })
})
