import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EnlaceBoton } from './EnlaceBoton'

describe('EnlaceBoton', () => {
  it('es un enlace con su texto como nombre accesible, sin leer la flecha', () => {
    render(<EnlaceBoton href="/es/registro">Encuentra a tu equipo</EnlaceBoton>)
    const enlace = screen.getByRole('link', { name: 'Encuentra a tu equipo' })
    expect(enlace).toHaveAttribute('href', '/es/registro')
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
