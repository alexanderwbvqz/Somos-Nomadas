import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ResultadoGoogle } from '../application/continuarConGoogle'
import type { ResultadoInicioSesion } from '../application/iniciarSesion'
import type { ResultadoReenvio } from '../application/reenviarConfirmacion'
import type { DatosInicioSesion } from '../domain/cuenta'
import { es } from '../language/es'
import { InicioSesionView } from './InicioSesionView'

// Al entrar, la vista cambia de página con el enrutador de Next: aquí se reemplaza por uno falso
const enrutador = vi.hoisted(() => ({ replace: vi.fn<(href: string) => void>() }))
vi.mock('next/navigation', () => ({ useRouter: () => enrutador }))
beforeEach(() => enrutador.replace.mockClear())

const t = es

function montar(
  resultado: ResultadoInicioSesion = { ok: true, correo: 'ana@correo.com' },
  google: ResultadoGoogle = { ok: true, correo: 'cuenta.google@ejemplo.com' },
  reenvio: ResultadoReenvio = { ok: true },
) {
  const alIniciar = vi.fn<(datos: DatosInicioSesion) => Promise<ResultadoInicioSesion>>(async () => resultado)
  const alContinuarConGoogle = vi.fn<(credencial: string) => Promise<ResultadoGoogle>>(async () => google)
  const alReenviar = vi.fn<(correo: string) => Promise<ResultadoReenvio>>(async () => reenvio)
  render(
    <InicioSesionView
      textos={t}
      alIniciar={alIniciar}
      alReenviar={alReenviar}
      alContinuarConGoogle={alContinuarConGoogle}
      hrefRegistro="/es/registro"
      hrefContinuar="/es/bienvenida"
    />,
  )
  return { alIniciar, alContinuarConGoogle, alReenviar, usuario: userEvent.setup() }
}

const iniciar = () => screen.getByRole('button', { name: t.inicio.enviar })

describe('InicioSesionView sin Google', () => {
  it('si no hay acción de Google no muestra el botón ni el separador, y el formulario sigue completo', () => {
    render(<InicioSesionView textos={t} alIniciar={vi.fn()} alReenviar={vi.fn()} hrefRegistro="/es/registro" hrefContinuar="/es/bienvenida" />)

    expect(screen.queryByRole('button', { name: t.google.continuar })).not.toBeInTheDocument()
    expect(screen.queryByText(t.google.separador)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Correo')).toBeInTheDocument()
    expect(iniciar()).toBeInTheDocument()
  })
})

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

  it('entra con los datos correctos y lleva directo a la bienvenida, sin pantalla intermedia', async () => {
    const { alIniciar, usuario } = montar()
    await usuario.type(screen.getByLabelText('Correo'), 'ana@correo.com')
    await usuario.type(screen.getByLabelText('Contraseña'), 'Clave-segura-9')
    await usuario.click(iniciar())

    await waitFor(() => expect(enrutador.replace).toHaveBeenCalledWith('/es/bienvenida'))
    expect(enrutador.replace).toHaveBeenCalledTimes(1)
    expect(alIniciar).toHaveBeenCalledWith({ correo: 'ana@correo.com', clave: 'Clave-segura-9' })
    expect(screen.queryByRole('heading', { level: 1, name: t.dentro.titulo })).not.toBeInTheDocument()
  })

  it('mientras cambia de página el botón sigue ocupado: no se puede enviar otra vez', async () => {
    const { alIniciar, usuario } = montar()
    await usuario.type(screen.getByLabelText('Correo'), 'ana@correo.com')
    await usuario.type(screen.getByLabelText('Contraseña'), 'Clave-segura-9')
    await usuario.click(iniciar())

    await waitFor(() => expect(enrutador.replace).toHaveBeenCalled())
    const ocupado = screen.getByRole('button', { name: t.inicio.enviando })
    expect(ocupado).toBeDisabled()
    await usuario.click(ocupado)
    expect(alIniciar).toHaveBeenCalledTimes(1)
  })

  it('si los datos no corresponden avisa sin decir cuál falla, borra la contraseña y vuelve a ella', async () => {
    const { usuario } = montar({ ok: false, errores: {}, motivo: 'credenciales' })
    await usuario.type(screen.getByLabelText('Correo'), 'ana@correo.com')
    await usuario.type(screen.getByLabelText('Contraseña'), 'Incorrecta-1')
    await usuario.click(iniciar())

    expect(await screen.findByRole('alert')).toHaveTextContent(t.inicio.credenciales)
    expect(screen.getByLabelText('Contraseña')).toHaveValue('')
    expect(screen.getByLabelText('Contraseña')).toHaveFocus()
    expect(screen.getByLabelText('Correo')).toHaveValue('ana@correo.com')
    expect(enrutador.replace).not.toHaveBeenCalled()
  })

  it('si la clave es correcta pero el correo no está confirmado, lo dice y no borra la contraseña', async () => {
    const { usuario } = montar({ ok: false, errores: {}, motivo: 'sinConfirmar' })
    await usuario.type(screen.getByLabelText('Correo'), 'ana@correo.com')
    await usuario.type(screen.getByLabelText('Contraseña'), 'Clave-segura-9')
    await usuario.click(iniciar())

    expect(await screen.findByRole('alert')).toHaveTextContent(t.avisos.sinConfirmar)
    // La contraseña era buena: no hace falta volver a escribirla
    expect(screen.getByLabelText('Contraseña')).toHaveValue('Clave-segura-9')
  })

  it('con el correo sin confirmar ofrece enviar otro enlace al correo escrito', async () => {
    const { alReenviar, usuario } = montar({ ok: false, errores: {}, motivo: 'sinConfirmar' })
    await usuario.type(screen.getByLabelText('Correo'), 'ana@correo.com')
    await usuario.type(screen.getByLabelText('Contraseña'), 'Clave-segura-9')
    await usuario.click(iniciar())

    await usuario.click(await screen.findByRole('button', { name: t.inicio.otroEnlace.boton }))

    expect(alReenviar).toHaveBeenCalledExactlyOnceWith('ana@correo.com')
    expect(await screen.findByText(t.inicio.otroEnlace.enviado)).toBeInTheDocument()
  })

  it('el botón de otro enlace solo aparece con el correo sin confirmar', async () => {
    const { usuario } = montar({ ok: false, errores: {}, motivo: 'credenciales' })
    await usuario.type(screen.getByLabelText('Correo'), 'ana@correo.com')
    await usuario.type(screen.getByLabelText('Contraseña'), 'Clave-segura-9')
    await usuario.click(iniciar())

    await screen.findByRole('alert')
    expect(screen.queryByRole('button', { name: t.inicio.otroEnlace.boton })).not.toBeInTheDocument()
  })

  it('si pedir otro enlace topa con el límite, lo avisa', async () => {
    const { usuario } = montar({ ok: false, errores: {}, motivo: 'sinConfirmar' }, undefined, { ok: false, motivo: 'limite' })
    await usuario.type(screen.getByLabelText('Correo'), 'ana@correo.com')
    await usuario.type(screen.getByLabelText('Contraseña'), 'Clave-segura-9')
    await usuario.click(iniciar())

    await usuario.click(await screen.findByRole('button', { name: t.inicio.otroEnlace.boton }))

    expect(await screen.findByRole('status')).toHaveTextContent(t.avisos.limite)
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
