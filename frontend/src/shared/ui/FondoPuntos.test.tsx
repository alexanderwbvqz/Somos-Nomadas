import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FondoPuntos } from './FondoPuntos'

// jsdom no tiene lienzo, observador de tamaño ni animación: se sustituyen por espías para ver qué hace el componente
const dibujo = { setTransform: vi.fn(), clearRect: vi.fn(), fillRect: vi.fn(), fillStyle: '', globalAlpha: 1 }
const pedirCuadro = vi.fn(() => 7)
const cancelarCuadro = vi.fn()
const observar = vi.fn()
const desconectar = vi.fn()

function simular(movimientoReducido: boolean) {
  vi.stubGlobal('matchMedia', () => ({ matches: movimientoReducido }))
  vi.stubGlobal('requestAnimationFrame', pedirCuadro)
  vi.stubGlobal('cancelAnimationFrame', cancelarCuadro)
  vi.stubGlobal('ResizeObserver', class { observe = observar; disconnect = desconectar })
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(dibujo as unknown as CanvasRenderingContext2D)
}

beforeEach(() => vi.clearAllMocks())
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('FondoPuntos', () => {
  it('es solo adorno: el lienzo se oculta a los lectores de pantalla', () => {
    simular(false)
    const { container } = render(<FondoPuntos />)
    expect(container.querySelector('canvas')).toHaveAttribute('aria-hidden', 'true')
  })

  it('dibuja los puntos y se anima si no se pidió movimiento reducido', () => {
    simular(false)
    render(<FondoPuntos />)
    expect(dibujo.fillRect).toHaveBeenCalled()
    expect(pedirCuadro).toHaveBeenCalled()
  })

  it('con movimiento reducido dibuja una vez y no se anima', () => {
    simular(true)
    render(<FondoPuntos />)
    expect(dibujo.fillRect).toHaveBeenCalled()
    expect(pedirCuadro).not.toHaveBeenCalled()
  })

  it('al salir de la pantalla para la animación y deja de observar el tamaño', () => {
    simular(false)
    const { unmount } = render(<FondoPuntos />)
    unmount()
    expect(cancelarCuadro).toHaveBeenCalledWith(7)
    expect(desconectar).toHaveBeenCalled()
  })
})
