import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SeccionAliados, type SeccionAliadosProps } from './SeccionAliados'

const props: SeccionAliadosProps = {
  textos: {
    etiqueta: 'Aliados',
    tituloInicio: 'Ningún equipo crece solo.',
    tituloResaltado: 'Los respalda una red.',
    parrafo: 'Párrafo.',
    botonAliado: 'Quiero ser aliado',
    enlaceRed: 'Ver la red de aliados',
    nota: 'Revisamos cada postulación antes de publicarla.',
    etiquetaActivos: 'Aliados activos',
  },
  tipos: [
    { clave: 'mentores', numero: '01', nombre: 'Mentores', descripcion: 'Acompañan.', enlace: 'Ver mentores', href: '/es/aliados?tipo=mentores' },
    { clave: 'organizadores', numero: '02', nombre: 'Organizadores', descripcion: 'Ponen espacios.', enlace: 'Ver organizadores', href: '/es/aliados?tipo=organizadores' },
  ],
  activos: [],
  hrefAliado: '/es/aliados/postular',
  hrefRed: '/es/aliados',
}

describe('SeccionAliados', () => {
  it('muestra el titular, la nota de revisión y las dos llamadas a la acción', () => {
    render(<SeccionAliados {...props} />)
    expect(screen.getByRole('heading', { level: 2, name: /Ningún equipo crece solo/ })).toBeInTheDocument()
    expect(screen.getByText('Revisamos cada postulación antes de publicarla.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Quiero ser aliado' })).toHaveAttribute('href', '/es/aliados/postular')
    expect(screen.getByRole('link', { name: 'Ver la red de aliados' })).toHaveAttribute('href', '/es/aliados')
  })

  it('lista cada tipo con su descripción y un enlace a la red filtrada por ese tipo', () => {
    render(<SeccionAliados {...props} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Mentores' })).toBeInTheDocument()
    expect(screen.getByText('Ponen espacios.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver mentores' })).toHaveAttribute('href', '/es/aliados?tipo=mentores')
    expect(screen.getByRole('link', { name: 'Ver organizadores' })).toHaveAttribute('href', '/es/aliados?tipo=organizadores')
  })

  it('sin aliados activos no muestra el listado ni el número de activos', () => {
    render(<SeccionAliados {...props} />)
    expect(screen.queryByText('Aliados activos')).not.toBeInTheDocument()
    expect(screen.queryByText(/activo/)).not.toBeInTheDocument()
  })

  it('con aliados activos muestra el listado y el número de cada tipo', () => {
    render(
      <SeccionAliados
        {...props}
        tipos={[{ ...props.tipos[0]!, activos: '2 activos' }, props.tipos[1]!]}
        activos={[{ nombre: 'Aliado Uno' }, { nombre: 'Aliado Dos' }]}
      />,
    )
    expect(screen.getByText('Aliados activos')).toBeInTheDocument()
    expect(screen.getByText('Aliado Uno')).toBeInTheDocument()
    expect(screen.getByText('2 activos')).toBeInTheDocument()
  })
})
