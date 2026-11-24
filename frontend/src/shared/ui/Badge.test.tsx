import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from './Badge'

describe('Badge', () => {
  it('por defecto es suave', () => {
    render(<Badge>Pronto</Badge>)
    expect(screen.getByText('Pronto')).toHaveAttribute('data-tono', 'suave')
  })

  it('el tono oscuro se marca en data-tono', () => {
    render(<Badge tono="oscuro">Recomendado</Badge>)
    expect(screen.getByText('Recomendado')).toHaveAttribute('data-tono', 'oscuro')
  })

  it('el tono borde se marca en data-tono', () => {
    render(<Badge tono="borde">Tecnología</Badge>)
    expect(screen.getByText('Tecnología')).toHaveAttribute('data-tono', 'borde')
  })

  it('el formato respuesta usa letra de lectura, y el de etiqueta (por defecto) la pequeña en mayúsculas', () => {
    const { rerender } = render(<Badge>Pronto</Badge>)
    expect(screen.getByText('Pronto').className).toContain('text-etiqueta-chica')
    rerender(<Badge formato="respuesta">React</Badge>)
    expect(screen.getByText('React').className).toContain('text-cuerpo')
    expect(screen.getByText('React').className).not.toContain('text-etiqueta-chica')
  })
})
