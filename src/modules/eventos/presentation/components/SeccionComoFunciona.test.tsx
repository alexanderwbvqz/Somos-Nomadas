import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SeccionComoFunciona } from './SeccionComoFunciona'

const pasos = [
  { titulo: 'Confirma', texto: 'Avisas con tu WhatsApp.' },
  { titulo: 'Llega', texto: 'Registras tu llegada.' },
  { titulo: 'Conecta', texto: 'Recibes tus conexiones.' },
  { titulo: 'Participa', texto: 'Dinámicas en grupo.' },
]

describe('SeccionComoFunciona', () => {
  it('muestra el título de la sección como encabezado', () => {
    render(<SeccionComoFunciona textos={{ etiquetaSeccion: 'Cómo funciona un evento' }} pasos={pasos} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Cómo funciona un evento' })).toBeInTheDocument()
  })

  it('lista los pasos en orden, cada uno con su título y su texto', () => {
    render(<SeccionComoFunciona textos={{ etiquetaSeccion: 'Cómo funciona un evento' }} pasos={pasos} />)
    const lista = screen.getByRole('list')
    const elementos = within(lista).getAllByRole('listitem')
    expect(elementos).toHaveLength(4)
    expect(within(elementos[0]!).getByRole('heading', { level: 3, name: 'Confirma' })).toBeInTheDocument()
    expect(within(elementos[3]!).getByText('Dinámicas en grupo.')).toBeInTheDocument()
  })

  it('es una lista ordenada (el orden de los pasos importa)', () => {
    const { container } = render(<SeccionComoFunciona textos={{ etiquetaSeccion: 'x' }} pasos={pasos} />)
    expect(container.querySelector('ol')).not.toBeNull()
  })
})
