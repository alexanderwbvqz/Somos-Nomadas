import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LayoutPaso } from './LayoutPaso'

function montar() {
  render(
    <LayoutPaso etiqueta="Paso 02" titulo="Qué has hecho" subtitulo="Marca lo que hiciste." porQue={{ titulo: 'Por qué lo preguntamos', texto: 'Para saber tu nivel.' }}>
      <p>Contenido de la tarjeta</p>
    </LayoutPaso>,
  )
}

describe('LayoutPaso', () => {
  it('pone a un lado qué paso es, el título, el subtítulo y el porqué, y en la tarjeta el contenido', () => {
    montar()
    expect(screen.getByRole('heading', { level: 1, name: 'Qué has hecho' })).toBeInTheDocument()
    expect(screen.getByText('Paso 02')).toBeInTheDocument()
    expect(screen.getByText('Marca lo que hiciste.')).toBeInTheDocument()
    expect(screen.getByText('Por qué lo preguntamos')).toBeInTheDocument()
    expect(screen.getByText('Para saber tu nivel.')).toBeInTheDocument()
    expect(screen.getByText('Contenido de la tarjeta')).toBeInTheDocument()
  })

  it('es el <main> de la página y el contenido va dentro de él', () => {
    montar()
    expect(screen.getByRole('main')).toContainElement(screen.getByText('Contenido de la tarjeta'))
    expect(screen.getAllByRole('main')).toHaveLength(1)
  })
})
