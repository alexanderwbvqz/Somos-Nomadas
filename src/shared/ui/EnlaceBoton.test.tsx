import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EnlaceBoton } from './EnlaceBoton'

describe('EnlaceBoton', () => {
  it('es un enlace con su texto como nombre accesible, sin leer la flecha', () => {
    render(<EnlaceBoton href="/es/registro">Encuentra a tu equipo</EnlaceBoton>)
    const enlace = screen.getByRole('link', { name: 'Encuentra a tu equipo' })
    expect(enlace).toHaveAttribute('href', '/es/registro')
  })

  it('las variantes llena y de enlace tienen el texto como nombre accesible', () => {
    render(
      <>
        <EnlaceBoton href="/es/registro" variante="lleno">
          Postular
        </EnlaceBoton>
        <EnlaceBoton href="/es/directorio" variante="enlace">
          Ver perfiles
        </EnlaceBoton>
      </>,
    )
    expect(screen.getByRole('link', { name: 'Postular' })).toHaveAttribute('href', '/es/registro')
    expect(screen.getByRole('link', { name: 'Ver perfiles' })).toHaveAttribute('href', '/es/directorio')
  })

  it('la variante de texto también tiene el texto como nombre accesible', () => {
    render(
      <EnlaceBoton href="/es/directorio" variante="texto">
        Explorar directorio
      </EnlaceBoton>,
    )
    expect(screen.getByRole('link', { name: 'Explorar directorio' })).toHaveAttribute('href', '/es/directorio')
  })
})
