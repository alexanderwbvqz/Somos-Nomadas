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
  comoFunciona: {
    textos: { etiquetaSeccion: 'Cómo funciona un evento' },
    pasos: [
      { titulo: 'Confirma', texto: 'Avisas con tu WhatsApp.' },
      { titulo: 'Llega', texto: 'Registras tu llegada.' },
    ],
  },
  masEventos: {
    textos: {
      etiquetaSeccion: 'Más eventos',
      contador: '{cantidad} eventos',
      verMas: 'Ver más eventos',
      mostrando: 'Mostrando {mostrados} de {total}',
      confirmar: 'Confirmar asistencia',
    },
    eventos: [{ id: 'a', nombre: 'Un evento', fecha: '20 ene 2027', lugar: 'Lima', modalidad: 'Presencial', descripcion: 'D.', hrefConfirmar: 'https://wa.me/x' }],
  },
  llamado: {
    idTitulo: 'titulo-llamado-eventos',
    textos: {
      tituloInicio: '¿Tienes un espacio o una comunidad?',
      tituloResaltado: 'Organiza un evento con nosotros.',
      boton: 'Quiero ser aliado',
      nota: 'Nota.',
    },
    href: '/es/aliados/postular',
  },
}

describe('EventosView', () => {
  it('muestra el hero con el titular como encabezado principal', () => {
    render(<EventosView {...props} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Próximos eventos' })).toBeInTheDocument()
  })

  it('y debajo, en orden: el próximo evento, cómo funciona, más eventos y el llamado final', () => {
    render(<EventosView {...props} />)
    const titulos = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(titulos).toEqual([
      'El próximo evento',
      'Cómo funciona un evento',
      'Más eventos',
      '¿Tienes un espacio o una comunidad? Organiza un evento con nosotros.',
    ])
    expect(screen.getByRole('heading', { level: 3, name: 'Un evento' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Quiero ser aliado' })).toHaveAttribute('href', '/es/aliados/postular')
  })
})
