import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ResultadoReenvio } from '../../application/reenviarConfirmacion'
import { es } from '../../language/es'
import { ConfirmaCorreo } from './ConfirmaCorreo'

const t = es.confirmacion

function montar(resultado: ResultadoReenvio = { ok: true }) {
  const alReenviar = vi.fn<(correo: string) => Promise<ResultadoReenvio>>(async () => resultado)
  const alCambiarCorreo = vi.fn()
  render(<ConfirmaCorreo textos={es} correo="ana@correo.com" alReenviar={alReenviar} alCambiarCorreo={alCambiarCorreo} />)
  return { alReenviar, alCambiarCorreo }
}

const avanzar = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms) })
const botonReenviar = () => screen.getByRole('button', { name: t.reenviar })

describe('ConfirmaCorreo', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('muestra el correo, pone el foco en el título y empieza con el reenvío bloqueado', () => {
    montar()
    expect(screen.getByText('ana@correo.com')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: t.tarjetaTitulo })).toHaveFocus()
    expect(botonReenviar()).toBeDisabled()
    expect(screen.getByText('Podrás reenviarlo en 0:30.')).toBeInTheDocument()
  })

  it('la cuenta atrás baja cada segundo y a los 30 deja reenviar', async () => {
    montar()
    await avanzar(1000)
    expect(screen.getByText('Podrás reenviarlo en 0:29.')).toBeInTheDocument()
    await avanzar(29_000)
    expect(botonReenviar()).toBeEnabled()
    expect(screen.getByText(t.yaPuedes)).toBeInTheDocument()
  })

  it('al reenviar vuelve a mandar el enlace, avisa y reinicia la espera', async () => {
    const { alReenviar } = montar()
    await avanzar(30_000)
    fireEvent.click(botonReenviar())
    await avanzar(0)

    expect(alReenviar).toHaveBeenCalledWith('ana@correo.com')
    expect(screen.getByText(t.reenviado)).toBeInTheDocument()
    expect(botonReenviar()).toBeDisabled()
    expect(screen.getByText('Podrás reenviarlo en 0:30.')).toBeInTheDocument()
  })

  it('avisa si hubo demasiados reenvíos y no reinicia la espera', async () => {
    montar({ ok: false, motivo: 'limite' })
    await avanzar(30_000)
    fireEvent.click(botonReenviar())
    await avanzar(0)
    expect(screen.getByText(es.avisos.limite)).toBeInTheDocument()
    expect(botonReenviar()).toBeEnabled()
  })

  it('"Cambiar correo" avisa para volver al formulario', () => {
    const { alCambiarCorreo } = montar()
    fireEvent.click(screen.getByRole('button', { name: t.cambiarCorreo }))
    expect(alCambiarCorreo).toHaveBeenCalledTimes(1)
  })
})
