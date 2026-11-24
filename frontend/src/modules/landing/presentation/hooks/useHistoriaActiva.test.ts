import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useHistoriaActiva } from './useHistoriaActiva'

describe('useHistoriaActiva', () => {
  it('empieza en la primera historia y con su texto cerrado', () => {
    const { result } = renderHook(() => useHistoriaActiva(3))
    expect(result.current.activa).toBe(0)
    expect(result.current.abierta).toBe(false)
  })

  it('irA elige una historia y cierra el texto que estuviera abierto', () => {
    const { result } = renderHook(() => useHistoriaActiva(3))
    act(() => result.current.alternar())
    expect(result.current.abierta).toBe(true)
    act(() => result.current.irA(2))
    expect(result.current.activa).toBe(2)
    expect(result.current.abierta).toBe(false)
  })

  it('alternar abre y cierra sin cambiar de historia', () => {
    const { result } = renderHook(() => useHistoriaActiva(3))
    act(() => result.current.irA(1))
    act(() => result.current.alternar())
    expect(result.current).toMatchObject({ activa: 1, abierta: true })
    act(() => result.current.alternar())
    expect(result.current).toMatchObject({ activa: 1, abierta: false })
  })

  it('irA no se sale de la lista', () => {
    const { result } = renderHook(() => useHistoriaActiva(3))
    act(() => result.current.irA(99))
    expect(result.current.activa).toBe(2)
    act(() => result.current.irA(-5))
    expect(result.current.activa).toBe(0)
  })

  it('sin historias no hace nada y se queda en cero', () => {
    const { result } = renderHook(() => useHistoriaActiva(0))
    act(() => result.current.irA(2))
    act(() => result.current.alternar())
    expect(result.current.activa).toBe(0)
  })

  it('si la lista se acorta, la activa nunca queda fuera de ella', () => {
    const { result, rerender } = renderHook(({ cantidad }) => useHistoriaActiva(cantidad), { initialProps: { cantidad: 4 } })
    act(() => result.current.irA(3))
    rerender({ cantidad: 2 })
    expect(result.current.activa).toBe(1)
  })
})
