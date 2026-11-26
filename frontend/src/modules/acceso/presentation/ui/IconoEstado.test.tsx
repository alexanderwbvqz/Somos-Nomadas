import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { IconoEstado } from './IconoEstado'

describe('IconoEstado', () => {
  it.each(['confirmado', 'aviso', 'espera'] as const)('el de %s es decorativo: los lectores de pantalla lo saltan', (estado) => {
    const { container } = render(<IconoEstado estado={estado} />)

    const icono = container.firstElementChild
    expect(icono).toHaveAttribute('aria-hidden', 'true')
    expect(icono?.querySelector('svg')).not.toBeNull()
  })

  it('cada estado tiene su fondo y su dibujo', () => {
    const fondos = (['confirmado', 'aviso', 'espera'] as const).map((estado) => {
      const { container } = render(<IconoEstado estado={estado} />)
      const icono = container.firstElementChild
      return [icono?.className.match(/\bbg-[\w-]+/)?.[0], icono?.querySelector('svg')?.innerHTML]
    })

    expect(fondos.map(([fondo]) => fondo)).toEqual(['bg-degradado-amarillo', 'bg-degradado-durazno', 'bg-suave'])
    expect(new Set(fondos.map(([, dibujo]) => dibujo)).size).toBe(3)
  })

  it('confirmado dibuja la marca, aviso la exclamación y espera el reloj', () => {
    const dibujo = (estado: 'confirmado' | 'aviso' | 'espera') =>
      render(<IconoEstado estado={estado} />).container.querySelector('svg')?.innerHTML ?? ''

    expect(dibujo('confirmado')).toContain('m5 12.5 4.5 4.5L19 7.5')
    expect(dibujo('aviso')).toContain('M12 6.5v7')
    expect(dibujo('espera')).toContain('r="7.5"')
  })
})
