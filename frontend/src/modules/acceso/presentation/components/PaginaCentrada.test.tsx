import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PaginaCentrada } from './PaginaCentrada'

describe('PaginaCentrada', () => {
  it('muestra la etiqueta, el título como encabezado principal, el texto y lo que va debajo', () => {
    render(
      <PaginaCentrada icono="confirmado" etiqueta="Founders" titulo="Correo confirmado" parrafo="Listo.">
        <button type="button">Iniciar sesión</button>
      </PaginaCentrada>,
    )

    expect(screen.getByText('Founders')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Correo confirmado' })).toBeInTheDocument()
    expect(screen.getByText('Listo.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument()
  })

  it('sin texto no deja un párrafo vacío', () => {
    const { container } = render(<PaginaCentrada icono="espera" etiqueta="Founders" titulo="Confirmando…" />)

    expect(container.querySelectorAll('p')).toHaveLength(1) // solo la etiqueta
  })

  it('al aparecer y al cambiar de estado (otro título), el foco va al título para que se anuncie', () => {
    const { rerender } = render(<PaginaCentrada icono="espera" etiqueta="Founders" titulo="Confirmando…" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus()

    ;(document.activeElement as HTMLElement).blur()
    rerender(<PaginaCentrada icono="confirmado" etiqueta="Founders" titulo="Correo confirmado" />)

    expect(screen.getByRole('heading', { level: 1, name: 'Correo confirmado' })).toHaveFocus()
  })

  it('el título se puede enfocar para anunciar el cambio de estado, y lleva el icono decorativo', () => {
    const { container } = render(<PaginaCentrada icono="aviso" etiqueta="Founders" titulo="Este enlace ya no sirve" />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute('tabindex', '-1')
    expect(container.querySelector('[aria-hidden="true"] svg')).not.toBeNull()
  })
})
