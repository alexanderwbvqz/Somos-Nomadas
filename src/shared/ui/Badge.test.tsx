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
})
