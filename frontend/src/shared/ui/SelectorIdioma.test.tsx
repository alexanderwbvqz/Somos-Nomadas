import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SelectorIdioma } from './SelectorIdioma'

const opciones = [
  { codigo: 'es', nombre: 'Español' },
  { codigo: 'en', nombre: 'English' },
  { codigo: 'pt', nombre: 'Português' },
]

describe('SelectorIdioma', () => {
  it('marca el idioma actual y enlaza a los otros dos', () => {
    render(<SelectorIdioma idiomaActual="es" opciones={opciones} etiqueta="Idioma" />)
    expect(screen.getByRole('navigation', { name: 'Idioma' })).toBeInTheDocument()
    expect(screen.getByText('Español')).toHaveAttribute('aria-current', 'true')
    expect(screen.queryByRole('link', { name: 'Español' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'English' })).toHaveAttribute('href', '/en')
    expect(screen.getByRole('link', { name: 'Português' })).toHaveAttribute('href', '/pt')
  })

  it('cada enlace declara su idioma', () => {
    render(<SelectorIdioma idiomaActual="en" opciones={opciones} etiqueta="Language" />)
    expect(screen.getByRole('link', { name: 'Português' })).toHaveAttribute('lang', 'pt')
    expect(screen.getByText('English')).toHaveAttribute('aria-current', 'true')
  })
})
