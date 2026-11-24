import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AliadosView, type AliadosViewProps } from './AliadosView'

const props: AliadosViewProps = {
  hero: { etiqueta: 'Aliados', titulo: 'Red de aliados', parrafo: 'Texto.' },
  listado: {
    textos: {
      etiquetaFiltro: 'Filtrar por tipo',
      todos: 'Todos',
      tipos: {
        mentores: { plural: 'Mentores', singular: 'Mentor' },
        organizadores: { plural: 'Organizadores', singular: 'Organizador' },
        estrategicos: { plural: 'Aliados estratégicos', singular: 'Aliado estratégico' },
      },
      leerMas: 'Leer más',
      verMas: 'Ver más aliados',
      mostrando: 'Mostrando {mostrados} de {total}',
      vacio: 'Sin aliados.',
    },
    aliados: [
      { id: 'a', nombre: 'Un aliado', tipo: 'mentores', descripcion: 'D.', etiquetaTipo: 'Mentor', href: '/es/aliados/a' },
    ],
  },
  llamado: {
    idTitulo: 'titulo-llamado-aliados',
    textos: {
      tituloInicio: '¿Tu organización puede',
      tituloResaltado: 'impulsar equipos?',
      boton: 'Quiero ser aliado',
      nota: 'Nota de revisión.',
    },
    href: '/es/aliados/postular',
  },
}

describe('AliadosView', () => {
  it('muestra el hero con el titular como encabezado principal', () => {
    render(<AliadosView {...props} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Red de aliados' })).toBeInTheDocument()
  })

  it('y debajo el filtro y el listado de aliados', () => {
    render(<AliadosView {...props} />)
    expect(screen.getByRole('group', { name: 'Filtrar por tipo' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Un aliado' })).toBeInTheDocument()
  })

  it('y al final el llamado a ser aliado', () => {
    render(<AliadosView {...props} />)
    expect(screen.getByRole('heading', { level: 2, name: '¿Tu organización puede impulsar equipos?' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Quiero ser aliado' })).toHaveAttribute('href', '/es/aliados/postular')
  })
})
