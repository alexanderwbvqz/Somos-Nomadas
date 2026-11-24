import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ContenidoAliado, tieneContenidoAliado, type ContenidoAliadoProps } from './ContenidoAliado'

const textos = {
  quienEs: 'Quién es',
  datosClave: 'Datos clave',
  enQuePuedeAyudarte: 'En qué puede ayudarte',
  paraEquipos: 'Para quién es',
  comoTrabajar: 'Cómo trabajar con este aliado',
}

const completo: ContenidoAliadoProps = {
  textos,
  descripcionLarga: ['Primer párrafo.', 'Segundo párrafo.'],
  datosClave: [
    { valor: '12 años', etiqueta: 'de experiencia' },
    { valor: '4 h al mes', etiqueta: 'de disponibilidad' },
  ],
  areas: ['Producto', 'Prototipos'],
  paraQuien: 'Equipos que ya tienen perfiles técnicos.',
  apoyos: ['Sesiones uno a uno', 'Revisión de prototipos'],
  pasos: [
    { titulo: 'Elige cómo contactar', texto: 'Usa el contacto de su ficha.' },
    { titulo: 'Cuéntale tu proyecto', texto: 'Explica qué necesitas.' },
  ],
}

const vacio: ContenidoAliadoProps = { textos, descripcionLarga: [], datosClave: [], areas: [], apoyos: [], pasos: undefined }

describe('ContenidoAliado', () => {
  it('con todos los datos muestra los cuatro bloques con su título como encabezado', () => {
    render(<ContenidoAliado {...completo} />)
    for (const titulo of ['Quién es', 'Datos clave', 'En qué puede ayudarte', 'Cómo trabajar con este aliado']) {
      expect(screen.getByRole('heading', { level: 2, name: titulo })).toBeInTheDocument()
    }
  })

  it('muestra los párrafos, los datos clave con su etiqueta, las áreas, para quién es y los apoyos', () => {
    render(<ContenidoAliado {...completo} />)
    expect(screen.getByText('Segundo párrafo.')).toBeInTheDocument()
    const datos = screen.getByRole('region', { name: 'Datos clave' })
    expect(within(datos).getByText('12 años')).toBeInTheDocument()
    expect(within(datos).getByText('de disponibilidad')).toBeInTheDocument()
    expect(screen.getByText('Prototipos')).toBeInTheDocument()
    expect(screen.getByText('Para quién es')).toBeInTheDocument()
    expect(screen.getByText('Equipos que ya tienen perfiles técnicos.')).toBeInTheDocument()
    expect(screen.getByText('Revisión de prototipos')).toBeInTheDocument()
  })

  it('los pasos son una lista ordenada con su título y su texto', () => {
    const { container } = render(<ContenidoAliado {...completo} />)
    expect(container.querySelector('ol')).not.toBeNull()
    expect(screen.getByRole('heading', { level: 3, name: 'Elige cómo contactar' })).toBeInTheDocument()
    expect(screen.getByText('Explica qué necesitas.')).toBeInTheDocument()
  })

  it('cada bloque aparece solo si tiene datos', () => {
    render(<ContenidoAliado {...vacio} descripcionLarga={['Solo esto.']} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Quién es' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Datos clave' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'En qué puede ayudarte' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Cómo trabajar con este aliado' })).not.toBeInTheDocument()
  })

  it('los pasos para trabajar con el aliado no se muestran si no hay forma de contacto', () => {
    render(<ContenidoAliado {...completo} pasos={undefined} />)
    expect(screen.queryByRole('heading', { name: 'Cómo trabajar con este aliado' })).not.toBeInTheDocument()
  })
})

describe('tieneContenidoAliado', () => {
  it('es falso sin ningún dato y verdadero con cualquiera', () => {
    expect(tieneContenidoAliado(vacio)).toBe(false)
    expect(tieneContenidoAliado({ ...vacio, descripcionLarga: ['x'] })).toBe(true)
    expect(tieneContenidoAliado({ ...vacio, areas: ['x'] })).toBe(true)
    expect(tieneContenidoAliado({ ...vacio, paraQuien: 'x' })).toBe(true)
    expect(tieneContenidoAliado({ ...vacio, pasos: [{ titulo: 'a', texto: 'b' }] })).toBe(true)
  })
})
