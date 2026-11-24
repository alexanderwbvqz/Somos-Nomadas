import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { PersonaHistoria } from '../../domain/Historia'
import { PersonasHistoria } from './PersonasHistoria'

const personas: PersonaHistoria[] = [
  { iniciales: 'SJ', nombre: 'Steve Jobs', area: 'marketing', aporte: 'Producto y ventas' },
  { iniciales: 'SW', nombre: 'Steve Wozniak', area: 'tecnologia', aporte: 'Ingeniería' },
  { iniciales: 'RW', nombre: 'Ronald Wayne', area: 'operaciones', aporte: 'Operaciones' },
]

describe('PersonasHistoria', () => {
  it('es un grupo con nombre accesible y una persona por elemento, con su nombre y su aporte', () => {
    render(<PersonasHistoria personas={personas} etiqueta="Quiénes son" />)
    const grupo = screen.getByRole('list', { name: 'Quiénes son' })
    const filas = within(grupo).getAllByRole('listitem')
    expect(filas).toHaveLength(3)
    expect(within(filas[0]!).getByText('Steve Jobs')).toBeInTheDocument()
    expect(within(filas[0]!).getByText('Producto y ventas')).toBeInTheDocument()
    expect(within(filas[1]!).getByText('Steve Wozniak')).toBeInTheDocument()
  })

  it('las iniciales son adorno: el nombre ya lo dice todo, así que no se anuncian', () => {
    render(<PersonasHistoria personas={personas} etiqueta="Quiénes son" />)
    const iniciales = screen.getByText('SJ')
    expect(iniciales.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('cada círculo lleva el color del área de su persona, el mismo que en el resto de la landing', () => {
    const { container } = render(<PersonasHistoria personas={personas} etiqueta="Quiénes son" />)
    const circulos = [...container.querySelectorAll('[data-area]')]
    expect(circulos.map((c) => c.getAttribute('data-area'))).toEqual(['marketing', 'tecnologia', 'operaciones'])
    expect(circulos[0]!.className).toContain('bg-degradado-azul')
    expect(circulos[1]!.className).toContain('bg-degradado-amarillo')
    expect(circulos[2]!.className).toContain('bg-degradado-durazno')
  })

  describe('con foto', () => {
    const conFoto: PersonaHistoria[] = personas.map((persona, lugar) => ({ ...persona, foto: `/founders-legends/prueba/persona-${lugar}.jpg` }))

    it('cada círculo enseña la foto de su persona, sin las iniciales, y la foto no se anuncia: el nombre ya está al lado', () => {
      const { container } = render(<PersonasHistoria personas={conFoto} etiqueta="Quiénes son" />)
      const fotos = [...container.querySelectorAll('img')]
      expect(fotos).toHaveLength(3)
      fotos.forEach((foto, lugar) => {
        expect(decodeURIComponent(foto.getAttribute('src') ?? '')).toContain(`/founders-legends/prueba/persona-${lugar}.jpg`)
        expect(foto).toHaveAttribute('alt', '')
      })
      expect(screen.queryByText('SJ')).not.toBeInTheDocument()
      expect(container.querySelectorAll('[data-area]')).toHaveLength(3)
    })

    it('el nombre y el aporte siguen debajo de cada foto', () => {
      render(<PersonasHistoria personas={conFoto} etiqueta="Quiénes son" />)
      expect(screen.getByText('Steve Jobs')).toBeInTheDocument()
      expect(screen.getByText('Producto y ventas')).toBeInTheDocument()
    })
  })

  it('con dos personas salen dos círculos', () => {
    const { container } = render(<PersonasHistoria personas={personas.slice(0, 2)} etiqueta="Quiénes son" />)
    expect(container.querySelectorAll('[data-area]')).toHaveLength(2)
  })
})
