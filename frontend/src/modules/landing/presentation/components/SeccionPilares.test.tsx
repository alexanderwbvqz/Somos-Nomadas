import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SeccionPilares, type SeccionPilaresProps } from './SeccionPilares'

const props: SeccionPilaresProps = {
  textos: {
    etiqueta: 'Los 4 pilares',
    tituloInicio: 'Todo equipo necesita las cuatro,',
    tituloResaltado: 'y hoy buscamos más de dos.',
    parrafo: 'Párrafo.',
    estado: 'Postulaciones abiertas',
    botonPostular: 'Postular',
    enlacePerfiles: 'Ver perfiles',
  },
  areas: [
    {
      clave: 'tecnologia',
      nombre: 'Tecnología',
      aporta: 'construye el producto',
      descripcion: 'Descripción de tecnología',
      claves: ['Desarrollo', 'Datos e IA'],
      hrefPostular: '/es/registro',
      hrefPerfiles: '/es/directorio?area=tecnologia',
    },
    {
      clave: 'finanzas',
      nombre: 'Finanzas',
      aporta: 'cuida el dinero',
      descripcion: 'Descripción de finanzas',
      claves: ['Modelado'],
      hrefPostular: '/es/registro',
      hrefPerfiles: '/es/directorio?area=finanzas',
    },
  ],
}

describe('SeccionPilares', () => {
  it('muestra el titular, el estado y una tarjeta por área con su nombre como título', () => {
    render(<SeccionPilares {...props} />)
    expect(screen.getByRole('heading', { level: 2, name: /Todo equipo necesita las cuatro/ })).toBeInTheDocument()
    expect(screen.getByText('Postulaciones abiertas')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Tecnología' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Finanzas' })).toBeInTheDocument()
  })

  it('cada tarjeta tiene Postular y Ver perfiles, y este último filtra por su área', () => {
    render(<SeccionPilares {...props} />)
    expect(screen.getAllByRole('link', { name: 'Postular' })).toHaveLength(2)
    const perfiles = screen.getAllByRole('link', { name: 'Ver perfiles' })
    expect(perfiles[0]).toHaveAttribute('href', '/es/directorio?area=tecnologia')
    expect(perfiles[1]).toHaveAttribute('href', '/es/directorio?area=finanzas')
  })

  it('muestra lo que aporta cada área, su descripción y sus palabras clave', () => {
    render(<SeccionPilares {...props} />)
    expect(screen.getByText('construye el producto')).toBeInTheDocument()
    expect(screen.getByText('Descripción de finanzas')).toBeInTheDocument()
    const tarjeta = screen.getByRole('heading', { level: 3, name: 'Tecnología' }).closest('li') as HTMLElement
    expect(within(tarjeta).getByText('Datos e IA')).toBeInTheDocument()
  })

  it('no hay etiquetas de "alta demanda" ni de comunidad: el desequilibrio lo explica el párrafo', () => {
    render(<SeccionPilares {...props} />)
    expect(screen.queryByText(/alta demanda|comunidad amplia/i)).not.toBeInTheDocument()
  })
})
