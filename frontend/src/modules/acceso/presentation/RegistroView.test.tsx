import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ResultadoGoogle } from '../application/continuarConGoogle'
import type { ResultadoRegistro } from '../application/registrarCuenta'
import type { ResultadoReenvio } from '../application/reenviarConfirmacion'
import type { DatosRegistro } from '../domain/cuenta'
import { es } from '../language/es'
import { RegistroView } from './RegistroView'

const t = es

function montar(resultado: ResultadoRegistro = { ok: true, correo: 'ana@correo.com' }, google: ResultadoGoogle = { ok: true, correo: 'cuenta.google@ejemplo.com' }) {
  const alRegistrar = vi.fn<(datos: DatosRegistro) => Promise<ResultadoRegistro>>(async () => resultado)
  const alReenviar = vi.fn<(correo: string) => Promise<ResultadoReenvio>>(async () => ({ ok: true }))
  const alContinuarConGoogle = vi.fn<(credencial: string) => Promise<ResultadoGoogle>>(async () => google)
  render(
    <RegistroView
      textos={t}
      alRegistrar={alRegistrar}
      alReenviar={alReenviar}
      alContinuarConGoogle={alContinuarConGoogle}
      hrefInicioSesion="/es/iniciar-sesion"
      hrefPolitica="/es/politica-de-datos"
      hrefContinuar="/es/bienvenida"
    />,
  )
  return { alRegistrar, alReenviar, alContinuarConGoogle, usuario: userEvent.setup() }
}

type Usuario = ReturnType<typeof userEvent.setup>

async function rellenar(usuario: Usuario, clave = 'Clave-segura-9') {
  await usuario.type(screen.getByLabelText('Correo'), 'Ana@Correo.com')
  await usuario.type(screen.getByLabelText('Contraseña'), clave)
  await usuario.click(screen.getByRole('checkbox', { name: /política de datos/ }))
}

const aceptarPolitica = (usuario: Usuario) => usuario.click(screen.getByRole('checkbox', { name: /política de datos/ }))

const crearCuenta = () => screen.getByRole('button', { name: t.registro.enviar })

describe('RegistroView', () => {
  it('muestra el título, los tres pasos, Google y el enlace para iniciar sesión', () => {
    montar()
    expect(screen.getByRole('heading', { level: 1, name: t.registro.titulo })).toBeInTheDocument()
    expect(screen.getByText(t.registro.pasos[1]!.titulo)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: t.google.continuar })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: t.registro.pie.enlace })).toHaveAttribute('href', '/es/iniciar-sesion')
  })

  it('no pide nombre, apellidos ni país: eso se pide dentro, en el perfil', () => {
    montar()
    expect(screen.queryByLabelText('Nombre')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Apellidos')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('País')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Correo')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
  })

  it('"Crear cuenta" empieza apagado y se enciende al marcar la casilla de la política', async () => {
    const { alRegistrar, usuario } = montar()
    expect(crearCuenta()).toBeDisabled()
    await usuario.click(crearCuenta())
    expect(alRegistrar).not.toHaveBeenCalled()
    await aceptarPolitica(usuario)
    expect(crearCuenta()).toBeEnabled()
    await aceptarPolitica(usuario)
    expect(crearCuenta()).toBeDisabled()
  })

  it('la casilla va entre la contraseña y el botón de crear cuenta', () => {
    montar()
    const clave = screen.getByLabelText('Contraseña')
    const casilla = screen.getByRole('checkbox', { name: /política de datos/ })
    expect(clave.compareDocumentPosition(casilla) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(casilla.compareDocumentPosition(crearCuenta()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('con la casilla marcada y el resto vacío muestra los errores y lleva el foco al correo', async () => {
    const { alRegistrar, usuario } = montar()
    await aceptarPolitica(usuario)
    await usuario.click(crearCuenta())

    expect(alRegistrar).not.toHaveBeenCalled()
    expect(screen.getByText(t.errores.correo)).toBeInTheDocument()
    expect(screen.getByText('Usa al menos 8 caracteres.')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo')).toHaveFocus()
  })

  it('pide una contraseña de al menos 8 caracteres', async () => {
    const { alRegistrar, usuario } = montar()
    await rellenar(usuario, 'corta')
    await usuario.click(crearCuenta())
    expect(alRegistrar).not.toHaveBeenCalled()
    expect(screen.getByText('Usa al menos 8 caracteres.')).toBeInTheDocument()
  })

  it('el indicador de fortaleza cambia al escribir', async () => {
    const { usuario } = montar()
    expect(screen.getByText(t.registro.fuerza.minimo)).toBeInTheDocument()
    await usuario.type(screen.getByLabelText('Contraseña'), 'corta')
    expect(screen.getByText(t.registro.fuerza.muyCorta)).toBeInTheDocument()
    await usuario.clear(screen.getByLabelText('Contraseña'))
    await usuario.type(screen.getByLabelText('Contraseña'), 'letras123')
    // Larga pero sin mayúscula ni símbolo: sigue incompleta
    expect(screen.getByText(t.registro.fuerza.muyCorta)).toBeInTheDocument()
    await usuario.clear(screen.getByLabelText('Contraseña'))
    await usuario.type(screen.getByLabelText('Contraseña'), 'Letras-123')
    expect(screen.getByText(t.registro.fuerza.aceptable)).toBeInTheDocument()
    await usuario.clear(screen.getByLabelText('Contraseña'))
    await usuario.type(screen.getByLabelText('Contraseña'), 'Letras-123456')
    expect(screen.getByText(t.registro.fuerza.buena)).toBeInTheDocument()
  })

  it('dice qué regla falta en la contraseña, en el idioma de la persona', async () => {
    const { usuario, alRegistrar } = montar()
    await rellenar(usuario, 'clave-segura-9')
    await usuario.click(crearCuenta())
    expect(alRegistrar).not.toHaveBeenCalled()
    expect(screen.getByText(t.errores.claveSinMayuscula)).toBeInTheDocument()
  })

  it('"Mostrar" deja ver la contraseña y "Ocultar" la esconde', async () => {
    const { usuario } = montar()
    const campo = screen.getByLabelText('Contraseña')
    expect(campo).toHaveAttribute('type', 'password')
    await usuario.click(screen.getByRole('button', { name: t.campos.mostrar }))
    expect(campo).toHaveAttribute('type', 'text')
    await usuario.click(screen.getByRole('button', { name: t.campos.ocultar }))
    expect(campo).toHaveAttribute('type', 'password')
  })

  it('envía solo correo, contraseña y política, y muestra a qué correo fue el enlace', async () => {
    const { alRegistrar, usuario } = montar()
    await rellenar(usuario)
    await usuario.click(crearCuenta())

    await waitFor(() => expect(alRegistrar).toHaveBeenCalledTimes(1))
    expect(alRegistrar.mock.calls[0]?.[0]).toEqual({ correo: 'Ana@Correo.com', clave: 'Clave-segura-9', aceptaPolitica: true, sitioSecundario: '' })
    expect(await screen.findByRole('heading', { level: 1, name: t.confirmacion.titulo })).toBeInTheDocument()
    expect(screen.getByText('ana@correo.com')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: t.confirmacion.tarjetaTitulo })).toHaveFocus()
  })

  it('muestra los errores que devuelve el servidor y vuelve al campo con problema', async () => {
    const { usuario } = montar({ ok: false, errores: { correo: 'correoInvalido' } })
    await rellenar(usuario)
    await usuario.click(crearCuenta())
    expect(await screen.findByText(t.errores.correoInvalido)).toBeInTheDocument()
    expect(screen.getByLabelText('Correo')).toHaveFocus()
  })

  it('avisa si hubo demasiados intentos o si falló', async () => {
    const { usuario } = montar({ ok: false, errores: {}, motivo: 'limite' })
    await rellenar(usuario)
    await usuario.click(crearCuenta())
    expect(await screen.findByRole('alert')).toHaveTextContent(t.avisos.limite)
  })

  it('el campo trampa existe, está oculto a lectores y fuera del orden de tabulación', () => {
    montar()
    const trampa = document.querySelector<HTMLInputElement>('input[name="sitio-secundario"]')
    expect(trampa).not.toBeNull()
    expect(trampa?.tabIndex).toBe(-1)
    expect(trampa?.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('"Cambiar correo" vuelve al formulario con lo ya escrito', async () => {
    const { usuario } = montar()
    await rellenar(usuario)
    await usuario.click(crearCuenta())
    await usuario.click(await screen.findByRole('button', { name: t.confirmacion.cambiarCorreo }))
    expect(screen.getByLabelText('Correo')).toHaveValue('Ana@Correo.com')
    expect(screen.getByLabelText('Correo')).toHaveFocus()
  })
})

describe('RegistroView con Google', () => {
  it('Google no se apaga ni pide la casilla, y bajo su botón no hay nota de aceptación', () => {
    montar()
    expect(screen.getByRole('button', { name: t.google.continuar })).toBeEnabled()
    expect(screen.queryByText(/Al continuar con Google/)).not.toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'política de datos' })).toHaveLength(1)
  })

  it('entra directo con Google: sin confirmar el correo y sin tocar el formulario', async () => {
    const { alContinuarConGoogle, alRegistrar, usuario } = montar()
    await usuario.click(screen.getByRole('button', { name: t.google.continuar }))

    await waitFor(() => expect(alContinuarConGoogle).toHaveBeenCalledTimes(1))
    expect(alContinuarConGoogle.mock.calls[0]?.[0]).toEqual(expect.any(String))
    expect(await screen.findByRole('heading', { level: 1, name: t.dentro.titulo })).toBeInTheDocument()
    expect(screen.getByText('Entraste como cuenta.google@ejemplo.com. Tu panel estará disponible muy pronto.')).toBeInTheDocument()
    expect(alRegistrar).not.toHaveBeenCalled()
    expect(screen.queryByRole('heading', { name: t.confirmacion.titulo })).not.toBeInTheDocument()
  })

  it('si Google no valida la cuenta, avisa y se queda en el formulario', async () => {
    const { usuario } = montar(undefined, { ok: false, motivo: 'rechazada' })
    await usuario.click(screen.getByRole('button', { name: t.google.continuar }))
    expect(await screen.findByRole('alert')).toHaveTextContent(t.avisos.google)
    expect(screen.getByLabelText('Correo')).toBeInTheDocument()
  })

  it('avisa si hubo demasiados intentos con Google', async () => {
    const { usuario } = montar(undefined, { ok: false, motivo: 'limite' })
    await usuario.click(screen.getByRole('button', { name: t.google.continuar }))
    expect(await screen.findByRole('alert')).toHaveTextContent(t.avisos.limite)
  })
})
