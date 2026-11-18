import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SeccionCifras } from './SeccionCifras'

const props = {
  textos: { titulo: 'Por qué importa el equipo', parrafo: 'Párrafo.', etiquetaLista: 'Cifras sobre equipos' },
  items: [
    { clave: 'a', cifra: '23 %', texto: 'fracasan por no tener el equipo adecuado', fuente: 'CB Insights' },
    { clave: 'b', cifra: '7×', texto: 'más capital con mentores', fuente: 'Startup Genome, 2011' },
  ],
}

describe('SeccionCifras', () => {
  it('muestra el título y una cifra por elemento con su texto y su fuente', () => {
    render(<SeccionCifras {...props} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Por qué importa el equipo' })).toBeInTheDocument()
    const lista = screen.getByRole('list', { name: 'Cifras sobre equipos' })
    const elementos = within(lista).getAllByRole('listitem')
    expect(elementos).toHaveLength(2)
    expect(within(elementos[0]!).getByText('23 %')).toBeInTheDocument()
    expect(within(elementos[0]!).getByText('CB Insights')).toBeInTheDocument()
    expect(within(elementos[1]!).getByText('7×')).toBeInTheDocument()
  })
})
