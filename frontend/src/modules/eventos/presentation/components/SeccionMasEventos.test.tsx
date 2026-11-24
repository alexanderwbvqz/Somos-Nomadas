import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { EventoListadoVista } from '../mappers/vistaProximoEvento'
import { SeccionMasEventos } from './SeccionMasEventos'

const textos = {
  etiquetaSeccion: 'Más eventos',
  contador: '{cantidad} eventos',
  verMas: 'Ver más eventos',
  mostrando: 'Mostrando {mostrados} de {total}',
  confirmar: 'Confirmar asistencia',
}

function eventos(cantidad: number): EventoListadoVista[] {
  return Array.from({ length: cantidad }, (_, i) => ({
    id: `e${i + 1}`,
    nombre: `Evento ${i + 1}`,
    fecha: '20 ene 2027',
    lugar: 'Lima',
    modalidad: 'Presencial',
    descripcion: `Descripción del evento ${i + 1}`,
    hrefConfirmar: `https://wa.me/1?text=e${i + 1}`,
  }))
}

describe('SeccionMasEventos', () => {
  it('muestra el título con el total y solo los primeros eventos', () => {
    render(<SeccionMasEventos textos={textos} eventos={eventos(30)} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Más eventos' })).toBeInTheDocument()
    expect(screen.getByText('30 eventos')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(9)
    expect(screen.getByText('Mostrando 9 de 30')).toBeInTheDocument()
  })

  it('cada evento muestra su descripción', () => {
    render(<SeccionMasEventos textos={textos} eventos={eventos(3)} />)
    expect(screen.getByText('Descripción del evento 1')).toBeInTheDocument()
    expect(screen.getByText('Descripción del evento 3')).toBeInTheDocument()
  })

  it('cada evento trae su enlace para confirmar asistencia', () => {
    render(<SeccionMasEventos textos={textos} eventos={eventos(3)} />)
    const enlaces = screen.getAllByRole('link', { name: 'Confirmar asistencia' })
    expect(enlaces).toHaveLength(3)
    expect(enlaces[0]).toHaveAttribute('href', 'https://wa.me/1?text=e1')
  })

  it('Ver más eventos añade nueve cada vez y actualiza el contador', async () => {
    render(<SeccionMasEventos textos={textos} eventos={eventos(30)} />)
    await userEvent.click(screen.getByRole('button', { name: 'Ver más eventos' }))
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(18)
    expect(screen.getByText('Mostrando 18 de 30')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Ver más eventos' }))
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(27)
  })

  it('al mostrar el último grupo el botón desaparece y el foco pasa al contador', async () => {
    render(<SeccionMasEventos textos={textos} eventos={eventos(12)} />)
    await userEvent.click(screen.getByRole('button', { name: 'Ver más eventos' }))
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(12)
    expect(screen.queryByRole('button', { name: 'Ver más eventos' })).not.toBeInTheDocument()
    expect(screen.getByText('Mostrando 12 de 12')).toHaveFocus()
  })

  it('con 9 eventos o menos no hay botón de ver más', () => {
    render(<SeccionMasEventos textos={textos} eventos={eventos(9)} />)
    expect(screen.queryByRole('button', { name: 'Ver más eventos' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(9)
  })

  it('sin eventos no muestra la sección', () => {
    const { container } = render(<SeccionMasEventos textos={textos} eventos={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
