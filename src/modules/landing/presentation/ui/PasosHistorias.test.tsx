import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { idPestanaHistoria, PasosHistorias, type PasoHistoria } from './PasosHistorias'

const pasos: PasoHistoria[] = [
  { clave: 'apple', nombre: 'Apple', combinacion: 'Ingeniería + Ventas' },
  { clave: 'airbnb', nombre: 'Airbnb', combinacion: 'Diseño + Ingeniería' },
  { clave: 'nike', nombre: 'Nike', combinacion: 'Finanzas + Producto' },
]

function montar(activa = 0) {
  const alElegir = vi.fn()
  render(<PasosHistorias pasos={pasos} activa={activa} alElegir={alElegir} etiqueta="Elige una historia" idBase="h" idPanel="panel" />)
  return { alElegir, usuario: userEvent.setup() }
}

describe('PasosHistorias', () => {
  it('es una lista de pestañas con nombre accesible, una por historia, con su nombre y su combinación', () => {
    montar()
    expect(screen.getByRole('tablist', { name: 'Elige una historia' })).toBeInTheDocument()
    const pestanas = screen.getAllByRole('tab')
    expect(pestanas).toHaveLength(3)
    expect(pestanas[1]).toHaveTextContent('Airbnb')
    expect(pestanas[1]).toHaveTextContent('Diseño + Ingeniería')
    pestanas.forEach((pestana) => expect(pestana).toHaveAttribute('aria-controls', 'panel'))
    expect(pestanas.map((pestana) => pestana.id)).toEqual([idPestanaHistoria('h', 0), idPestanaHistoria('h', 1), idPestanaHistoria('h', 2)])
  })

  it('solo la activa está seleccionada y solo ella entra con Tab (las demás, con las flechas)', () => {
    montar(1)
    const pestanas = screen.getAllByRole('tab')
    expect(pestanas.map((p) => p.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false'])
    expect(pestanas.map((p) => p.getAttribute('tabindex'))).toEqual(['-1', '0', '-1'])
  })

  it('la línea de la activa está marcada para llenarse', () => {
    montar(2)
    const lineas = screen.getAllByRole('tab').map((p) => p.querySelector('[data-activo]')?.getAttribute('data-activo'))
    expect(lineas).toEqual(['false', 'false', 'true'])
  })

  it('al pulsar una, la elige', async () => {
    const { alElegir, usuario } = montar()
    await usuario.click(screen.getByRole('tab', { name: /Nike/ }))
    expect(alElegir).toHaveBeenCalledWith(2)
  })

  it('las flechas eligen la siguiente y la anterior, dando la vuelta, y llevan el foco a esa pestaña', async () => {
    const { alElegir, usuario } = montar(2)
    screen.getAllByRole('tab')[2]!.focus()
    await usuario.keyboard('{ArrowRight}')
    expect(alElegir).toHaveBeenLastCalledWith(0)
    expect(screen.getAllByRole('tab')[0]).toHaveFocus()
    await usuario.keyboard('{ArrowLeft}')
    expect(alElegir).toHaveBeenLastCalledWith(2)
  })

  it('las teclas que usa cancelan su acción por defecto, para que la página no se desplace', () => {
    montar()
    const pestana = screen.getAllByRole('tab')[0]!
    for (const tecla of ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End']) {
      expect(fireEvent.keyDown(pestana, { key: tecla }), tecla).toBe(false)
    }
    expect(fireEvent.keyDown(pestana, { key: 'a' })).toBe(true)
  })

  it('Inicio y Fin van a la primera y a la última', async () => {
    const { alElegir, usuario } = montar(1)
    screen.getAllByRole('tab')[1]!.focus()
    await usuario.keyboard('{End}')
    expect(alElegir).toHaveBeenLastCalledWith(2)
    expect(screen.getAllByRole('tab')[2]).toHaveFocus()
    await usuario.keyboard('{Home}')
    expect(alElegir).toHaveBeenLastCalledWith(0)
  })

  it('otras teclas no hacen nada', async () => {
    const { alElegir, usuario } = montar()
    screen.getAllByRole('tab')[0]!.focus()
    await usuario.keyboard('a{Escape}')
    expect(alElegir).not.toHaveBeenCalled()
  })
})
