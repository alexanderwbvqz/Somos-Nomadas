import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LandingView } from './LandingView'

const props = {
  textos: {
    tituloInicio: 'Los grandes proyectos nacen cuando encuentran a las',
    tituloResaltado: 'personas correctas.',
    parrafo: 'Texto de ejemplo del párrafo.',
    botonPrincipal: 'Encuentra a tu equipo',
    enlaceSecundario: 'Explorar directorio',
    etiquetaAliados: 'Empresas que nos apoyan',
    etiquetaDatos: 'Por qué importa el equipo',
    ventajas: ['100 % gratis', 'Match con IA'],
  },
  datos: [{ clave: 'a', cifra: '23 %', texto: 'fracasan por no tener el equipo adecuado', fuente: 'CB Insights' }],
  aliados: [],
  hrefPostular: '/es/registro',
  hrefDirectorio: '/es/directorio',
}

describe('LandingView', () => {
  it('muestra el titular, los datos con su fuente y los dos enlaces', () => {
    render(<LandingView {...props} />)
    expect(screen.getByRole('heading', { level: 1, name: /personas correctas/ })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Por qué importa el equipo' })).toBeInTheDocument()
    expect(screen.getByText('23 %')).toBeInTheDocument()
    expect(screen.getByText('CB Insights')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Encuentra a tu equipo' })).toHaveAttribute('href', '/es/registro')
    expect(screen.getByRole('link', { name: 'Explorar directorio' })).toHaveAttribute('href', '/es/directorio')
  })

  it('no muestra la franja de aliados si no hay aliados', () => {
    render(<LandingView {...props} />)
    expect(screen.queryByRole('group', { name: 'Empresas que nos apoyan' })).not.toBeInTheDocument()
  })

  it('muestra la franja cuando hay aliados', () => {
    render(<LandingView {...props} aliados={[{ nombre: 'Aliado' }]} />)
    expect(screen.getByRole('group', { name: 'Empresas que nos apoyan' })).toBeInTheDocument()
  })
})
