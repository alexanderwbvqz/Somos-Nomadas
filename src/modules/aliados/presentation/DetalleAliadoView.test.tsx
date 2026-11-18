import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DetalleAliadoView, type DetalleAliadoViewProps } from './DetalleAliadoView'

const textosContenido = {
  quienEs: 'Quién es',
  datosClave: 'Datos clave',
  enQuePuedeAyudarte: 'En qué puede ayudarte',
  paraEquipos: 'Para quién es',
  comoTrabajar: 'Cómo trabajar con este aliado',
}
const textosFicha = {
  tipo: 'Tipo',
  ciudad: 'Ciudad',
  sitioWeb: 'Sitio web',
  enLaRed: 'En la red desde',
  redes: 'Redes',
  agendar: 'Agendar una llamada',
  whatsapp: 'Escribir por WhatsApp',
  notaContacto: 'Nota.',
}

const props: DetalleAliadoViewProps = {
  cabecera: {
    tipo: 'mentores',
    etiquetaTipo: 'Mentor',
    nombre: 'Mentoría en producto',
    descripcion: 'Descripción corta.',
    textoVolver: 'Red de aliados',
    hrefVolver: '/es/aliados',
  },
  contenido: {
    textos: textosContenido,
    descripcionLarga: ['Un párrafo largo.'],
    datosClave: [{ valor: '12 años', etiqueta: 'de experiencia' }],
    areas: ['Producto'],
    apoyos: [],
    pasos: undefined,
  },
  ficha: { textos: textosFicha, etiquetaTipo: 'Mentor', redes: [], hrefAgenda: 'https://agenda.example/a' },
  masAliados: {
    textos: { titulo: 'Más aliados de este tipo', leerMas: 'Leer más' },
    aliados: [{ id: 'b', nombre: 'Otro aliado', tipo: 'mentores', descripcion: 'D.', etiquetaTipo: 'Mentor', href: '/es/aliados/b' }],
  },
}

describe('DetalleAliadoView', () => {
  it('la cabecera muestra el nombre como encabezado principal, su tipo y el enlace para volver a la red', () => {
    render(<DetalleAliadoView {...props} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Mentoría en producto' })).toBeInTheDocument()
    expect(screen.getAllByText('Mentor').length).toBeGreaterThan(0)
    expect(screen.getByText('Descripción corta.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Red de aliados/ })).toHaveAttribute('href', '/es/aliados')
  })

  it('muestra el contenido, la ficha con su botón y los más aliados de este tipo', () => {
    render(<DetalleAliadoView {...props} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Quién es' })).toBeInTheDocument()
    expect(screen.getByText('12 años')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Agendar una llamada' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Más aliados de este tipo' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Leer más' })).toHaveAttribute('href', '/es/aliados/b')
  })

  it('un aliado sin más datos que lo básico muestra su ficha sin columna de contenido y sin más aliados', () => {
    render(
      <DetalleAliadoView
        {...props}
        contenido={{ textos: textosContenido, descripcionLarga: [], datosClave: [], areas: [], apoyos: [], pasos: undefined }}
        ficha={{ textos: textosFicha, etiquetaTipo: 'Mentor', redes: [] }}
        masAliados={{ ...props.masAliados, aliados: [] }}
      />,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Mentoría en producto' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Agendar una llamada' })).not.toBeInTheDocument()
  })
})
