import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { idiomas } from '@/shared/idiomas/idiomas'
import { LandingConectado } from './LandingConectado'

describe('LandingConectado', () => {
  it('arma la landing en español con las cifras formateadas y la fecha del dato de registrados', () => {
    render(<LandingConectado idioma="es" />)
    expect(screen.getByRole('heading', { level: 1, name: /personas correctas/ })).toBeInTheDocument()
    // La cifra lleva espacio duro entre el número y el %; \s lo admite
    expect(screen.getByText(/^75\s%$/)).toBeInTheDocument()
    expect(screen.getByText('7×')).toBeInTheDocument()
    expect(screen.getByText('75+')).toBeInTheDocument()
    expect(screen.getByText('Nómadas, noviembre de 2026')).toBeInTheDocument()
    expect(screen.getByText(/frente al 35 % de las nuevas/)).toBeInTheDocument()
  })

  it.each(idiomas)('en %s no queda ninguna plantilla {…} sin rellenar', (idioma) => {
    const { container } = render(<LandingConectado idioma={idioma} />)
    expect(container.textContent).not.toMatch(/\{\w+\}/)
  })

  it('incluye la sección del match con el total de 10 conexiones', () => {
    render(<LandingConectado idioma="es" />)
    expect(screen.getByRole('heading', { level: 2, name: /Pensado para formar equipos/ })).toBeInTheDocument()
    expect(screen.getByText('Hasta 10 conexiones')).toBeInTheDocument()
    expect(screen.getByText('1 + 3 + 3 + 3')).toBeInTheDocument()
  })

  it('incluye los cuatro pilares, cada uno con Postular y Ver perfiles hacia su área', () => {
    render(<LandingConectado idioma="es" />)
    expect(screen.getByRole('heading', { level: 2, name: /Todo equipo necesita las cuatro/ })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Postular' })).toHaveLength(4)
    const perfiles = screen.getAllByRole('link', { name: 'Ver perfiles' })
    expect(perfiles.map((enlace) => enlace.getAttribute('href'))).toEqual([
      '/es/directorio?area=tecnologia',
      '/es/directorio?area=marketing',
      '/es/directorio?area=operaciones',
      '/es/directorio?area=finanzas',
    ])
  })

  it('incluye la sección de aliados con los tres tipos y sin números mientras no haya aliados', () => {
    render(<LandingConectado idioma="es" />)
    expect(screen.getByRole('heading', { level: 2, name: /Ningún equipo crece solo/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Mentores' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Organizadores' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Aliados estratégicos' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver mentores' })).toHaveAttribute('href', '/es/aliados?tipo=mentores')
    expect(screen.getByRole('link', { name: 'Quiero ser aliado' })).toHaveAttribute('href', '/es/aliados/postular')
    expect(screen.queryByText(/\d+ activos?/)).not.toBeInTheDocument()
  })

  it('en inglés el dato comparado y los títulos salen en inglés', () => {
    render(<LandingConectado idioma="en" />)
    expect(screen.getByRole('heading', { level: 2, name: 'Why the team matters' })).toBeInTheDocument()
    expect(screen.getByText(/versus 35% of new ones/)).toBeInTheDocument()
  })
})
