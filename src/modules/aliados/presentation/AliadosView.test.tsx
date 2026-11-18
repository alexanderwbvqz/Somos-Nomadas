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
}

describe('AliadosView', () => {
  it('muestra el hero con el titular como encabezado principal', () => {
    render(<AliadosView {...props} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Red de aliados' })).toBeInTheDocument()
  })

  it('y debajo el filtro y el listado de aliados', () => {
    render(<AliadosView {...props} />)
    expect(screen.getByRole('group', { name: 'Filtrar por tipo' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Un aliado' })).toBeInTheDocument()
  })
})
