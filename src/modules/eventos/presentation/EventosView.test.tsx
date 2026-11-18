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
}

describe('EventosView', () => {
  it('muestra el hero con el titular como encabezado principal', () => {
    render(<EventosView {...props} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Próximos eventos' })).toBeInTheDocument()
  })

  it('y debajo la sección del próximo evento', () => {
    render(<EventosView {...props} />)
    expect(screen.getByRole('heading', { level: 2, name: 'El próximo evento' })).toBeInTheDocument()
  })
})
