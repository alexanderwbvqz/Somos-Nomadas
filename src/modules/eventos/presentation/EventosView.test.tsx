import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EventosView, type EventosViewProps } from './EventosView'

const props: EventosViewProps = {
  hero: { etiqueta: 'Eventos', titulo: 'Próximos eventos', parrafo: 'Texto.' },
  proximoEvento: {
    textos: {
      etiquetaSeccion: 'El próximo evento',
      lugar: 'Lugar',
      hora: 'Hora',
      confirmar: 'Confirmar asistencia',
      notaConfirmar: 'Nota.',
      sinEventosTitulo: 'Sin eventos',
      sinEventosTexto: 'Texto.',
      sinEventosBoton: 'Avísame',
    },
    proximo: undefined,
    hrefAvisar: 'https://wa.me/x',
  },
  masEventos: {
    textos: {
      etiquetaSeccion: 'Más eventos',
      contador: '{cantidad} eventos',
      verMas: 'Ver más eventos',
      mostrando: 'Mostrando {mostrados} de {total}',
      confirmar: 'Confirmar asistencia',
    },
    eventos: [{ id: 'a', nombre: 'Un evento', fecha: '20 ene 2027', lugar: 'Lima', modalidad: 'Presencial', hrefConfirmar: 'https://wa.me/x' }],
  },
}

describe('EventosView', () => {
  it('muestra el hero con el titular como encabezado principal', () => {
    render(<EventosView {...props} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Próximos eventos' })).toBeInTheDocument()
  })

  it('y debajo el próximo evento y el listado de más eventos', () => {
    render(<EventosView {...props} />)
    expect(screen.getByRole('heading', { level: 2, name: 'El próximo evento' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Más eventos' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Un evento' })).toBeInTheDocument()
  })
})
