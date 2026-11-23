import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ResultadoGoogle } from '../application/continuarConGoogle'
import type { ResultadoInicioSesion } from '../application/iniciarSesion'
import type { DatosInicioSesion } from '../domain/cuenta'
import { es } from '../language/es'
import { InicioSesionView } from './InicioSesionView'

const t = es

function montar(resultado: ResultadoInicioSesion = { ok: true, correo: 'ana@correo.com' }, google: ResultadoGoogle = { ok: true, correo: 'cuenta.google@ejemplo.com' }) {
  const alIniciar = vi.fn<(datos: DatosInicioSesion) => Promise<ResultadoInicioSesion>>(async () => resultado)
  const alContinuarConGoogle = vi.fn<(credencial: string) => Promise<ResultadoGoogle>>(async () => google)
  render(<InicioSesionView textos={t} alIniciar={alIniciar} alContinuarConGoogle={alContinuarConGoogle} hrefRegistro="/es/registro" hrefContinuar="/es/bienvenida" />)
  return { alIniciar, alContinuarConGoogle, usuario: userEvent.setup() }
}

const iniciar = () => screen.getByRole('button', { name: t.inicio.enviar })

describe('InicioSesionView', () => {
  it('muestra el título, Google y el enlace para registrarse, sin opción de enlace por correo', () => {
    montar()
    expect(screen.getByRole('heading', { level: 1, name: t.inicio.titulo })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: t.google.continuar })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: t.inicio.pie.enlace })).toHaveAttribute('href', '/es/registro')
    expect(screen.queryByText(/enlace/i)).not.toBeInTheDocument()
  })

  it('con el formulario vacío pide correo y contraseña y lleva el foco al correo', async () => {
    const { alIniciar, usuario } = montar()
    await usuario.click(iniciar())
    expect(alIniciar).not.toHaveBeenCalled()
    expect(screen.getByText(t.errores.correo)).toBeInTheDocument()
    expect(screen.getByText(t.errores.clave)).toBeInTheDocument()
    expect(screen.getByLabelText('Correo')).toHaveFocus()
  })

  it('entra con los datos correctos y dice con qué correo', async () => {
    const { alIniciar, usuario } = montar()
    await usuario.type(screen.getByLabelText('Correo'), 'ana@correo.com')
    await usuario.type(screen.getByLabelText('Contraseña'), 'clave-segura-9')
    await usuario.click(iniciar())

    await waitFor(() => expect(alIniciar).toHaveBeenCalledWith({ correo: 'ana@correo.com', clave: 'clave-segura-9' }))
    expect(await screen.findByRole('heading', { level: 1, name: t.dentro.titulo })).toBeInTheDocument()
    expect(screen.getByText('Entraste como ana@correo.com. Tu panel estará disponible muy pronto.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: t.dentro.continuar })).toHaveAttribute("href", "/es/bienvenida")
  })

  it('si los datos no corresponden avisa sin decir cuál falla, borra la contraseña y vuelve a ella', async () => {
    const { usuario } = montar({ ok: false, errores: {}, motivo: 'credenciales' })
    await usuario.type(screen.getByLabelText('Correo'), 'ana@correo.com')
    await usuario.type(screen.getByLabelText('Contraseña'), 'incorrecta-1')
    await usuario.click(iniciar())

    expect(await screen.findByRole('alert')).toHaveTextContent(t.inicio.credenciales)
    expect(screen.getByLabelText('Contraseña')).toHaveValue('')
    expect(screen.getByLabelText('Contraseña')).toHaveFocus()
    expect(screen.getByLabelText('Correo')).toHaveValue('ana@correo.com')
  })

  it('avisa si hubo demasiados intentos', async () => {
    const { usuario } = montar({ ok: false, errores: {}, motivo: 'limite' })
    await usuario.type(screen.getByLabelText('Correo'), 'ana@correo.com')
    await usuario.type(screen.getByLabelText('Contraseña'), 'x')
    await usuario.click(iniciar())
    expect(await screen.findByRole('alert')).toHaveTextContent(t.avisos.limite)
  })

  it('"Mostrar" deja ver la contraseña', async () => {
    const { usuario } = montar()
    await usuario.click(screen.getByRole('button', { name: t.campos.mostrar }))
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'text')
  })
})

describe('InicioSesionView con Google', () => {
  it('entra con Google y dice con qué correo', async () => {
    const { alContinuarConGoogle, alIniciar, usuario } = montar()
    await usuario.click(screen.getByRole('button', { name: t.google.continuar }))

    await waitFor(() => expect(alContinuarConGoogle).toHaveBeenCalledTimes(1))
    expect(await screen.findByRole('heading', { level: 1, name: t.dentro.titulo })).toBeInTheDocument()
    expect(screen.getByText('Entraste como cuenta.google@ejemplo.com. Tu panel estará disponible muy pronto.')).toBeInTheDocument()
    expect(alIniciar).not.toHaveBeenCalled()
  })

  it('si Google no valida la cuenta, avisa y se queda en el formulario', async () => {
    const { usuario } = montar(undefined, { ok: false, motivo: 'rechazada' })
    await usuario.click(screen.getByRole('button', { name: t.google.continuar }))
    expect(await screen.findByRole('alert')).toHaveTextContent(t.avisos.google)
    expect(screen.getByLabelText('Correo')).toBeInTheDocument()
  })
})
