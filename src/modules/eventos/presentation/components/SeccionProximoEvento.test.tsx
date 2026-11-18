import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SeccionProximoEvento, type SeccionProximoEventoProps } from './SeccionProximoEvento'

const textos: SeccionProximoEventoProps['textos'] = {
  etiquetaSeccion: 'El próximo evento',
  lugar: 'Lugar',
  hora: 'Hora',
  confirmar: 'Confirmar asistencia',
  notaConfirmar: 'Confirmas con tu WhatsApp.',
  sinEventosTitulo: 'Por ahora no hay eventos programados',
  sinEventosTexto: 'Escríbenos y te avisamos.',
  sinEventosBoton: 'Avísame',
}

const proximo = {
  nombre: 'Match and Building',
  dia: '12',
  mesAnio: 'dic · 2026',
  cuenta: 'En 24 días',
  modalidad: 'Presencial',
  lugar: 'Lima',
  hora: '6:00 p. m.',
  descripcion: 'Una noche para conocer a las personas del match.',
  hrefConfirmar: 'https://wa.me/51000000000?text=Hola',
}

describe('SeccionProximoEvento', () => {
  it('con un evento muestra su nombre, fecha, cuenta, lugar y hora', () => {
    render(<SeccionProximoEvento textos={textos} proximo={proximo} hrefAvisar="https://wa.me/x" />)
    expect(screen.getByRole('heading', { level: 2, name: 'El próximo evento' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Match and Building' })).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('En 24 días')).toBeInTheDocument()
    expect(screen.getByText('6:00 p. m.')).toBeInTheDocument()
    expect(screen.getByText('Presencial')).toBeInTheDocument()
  })

  it('Confirmar asistencia lleva al enlace de confirmación', () => {
    render(<SeccionProximoEvento textos={textos} proximo={proximo} hrefAvisar="https://wa.me/x" />)
    expect(screen.getByRole('link', { name: 'Confirmar asistencia' })).toHaveAttribute('href', proximo.hrefConfirmar)
    expect(screen.getByText('Confirmas con tu WhatsApp.')).toBeInTheDocument()
  })

  it('sin evento muestra el aviso y el botón para que le avisen, y no el de confirmar', () => {
    render(<SeccionProximoEvento textos={textos} proximo={undefined} hrefAvisar="https://wa.me/aviso" />)
    expect(screen.getByRole('heading', { level: 3, name: 'Por ahora no hay eventos programados' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Avísame' })).toHaveAttribute('href', 'https://wa.me/aviso')
    expect(screen.queryByRole('link', { name: 'Confirmar asistencia' })).not.toBeInTheDocument()
  })
})
