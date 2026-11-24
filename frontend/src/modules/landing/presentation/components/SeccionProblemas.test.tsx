import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SeccionProblemas } from './SeccionProblemas'

const props = {
  textos: {
    tituloInicio: 'Las ideas están en todas partes.',
    tituloFin: 'Los equipos que las construyen, no.',
    subtitulo: 'Subtítulo de ejemplo.',
    etiquetaProblema: 'El problema común',
    etiquetaSolucion: 'La solución Nómadas',
    diagrama: {
      descripcion: 'Las cuatro áreas se superponen',
      pie: 'Cuatro áreas, un equipo completo.',
      tecnologia: 'Tecnología',
      marketing: 'Marketing & Ventas',
      operaciones: 'Operaciones',
      finanzas: 'Finanzas',
      equipo: 'Equipo',
      roles: { tecnologia: 'a', marketing: 'b', operaciones: 'c', finanzas: 'd' },
    },
  },
  items: [
    { clave: 'a', tema: 'Tema A', titulo: 'Primer problema', problema: 'Texto del primer problema', solucion: 'Solución del primero' },
    { clave: 'b', tema: 'Tema B', titulo: 'Segundo problema', problema: 'Texto del segundo', solucion: 'Solución del segundo' },
  ],
}

describe('SeccionProblemas', () => {
  it('muestra el titular y el diagrama con nombre accesible', () => {
    render(<SeccionProblemas {...props} />)
    expect(screen.getByRole('heading', { level: 2, name: /Las ideas están en todas partes/ })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Las cuatro áreas se superponen' })).toBeInTheDocument()
  })

  it('muestra cada problema con su solución, sin necesidad de abrir nada', () => {
    render(<SeccionProblemas {...props} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Primer problema' })).toBeInTheDocument()
    expect(screen.getByText('Texto del primer problema')).toBeVisible()
    expect(screen.getByText('Solución del primero')).toBeVisible()
    expect(screen.getByText('Solución del segundo')).toBeVisible()
    expect(screen.getAllByText('El problema común')).toHaveLength(2)
  })
})
