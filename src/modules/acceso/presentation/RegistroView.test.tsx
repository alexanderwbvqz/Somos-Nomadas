import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ResultadoRegistro } from '../application/registrarCuenta'
import type { ResultadoReenvio } from '../application/reenviarConfirmacion'
import type { DatosRegistro } from '../domain/cuenta'
import { es } from '../language/es'
import { RegistroView } from './RegistroView'

const t = es

function montar(resultado: ResultadoRegistro = { ok: true, correo: 'ana@correo.com' }) {
  const alRegistrar = vi.fn<(datos: DatosRegistro) => Promise<ResultadoRegistro>>(async () => resultado)
  const alReenviar = vi.fn<(correo: string) => Promise<ResultadoReenvio>>(async () => ({ ok: true }))
  render(
    <RegistroView textos={t} alRegistrar={alRegistrar} alReenviar={alReenviar} hrefInicioSesion="/es/iniciar-sesion" hrefPolitica="/es/politica-de-datos" />,
  )
  return { alRegistrar, alReenviar, usuario: userEvent.setup() }
}

type Usuario = ReturnType<typeof userEvent.setup>

async function rellenar(usuario: Usuario, clave = 'clave-segura-9') {
  await usuario.type(screen.getByLabelText('Nombre'), 'Ana')
  await usuario.type(screen.getByLabelText('Apellidos'), 'Pérez Rojas')
  await usuario.selectOptions(screen.getByLabelText('País'), 'Perú')
  await usuario.type(screen.getByLabelText('Correo'), 'Ana@Correo.com')
  await usuario.type(screen.getByLabelText('Contraseña'), clave)
  await usuario.click(screen.getByRole('checkbox', { name: /política de datos/ }))
}

const crearCuenta = () => screen.getByRole('button', { name: t.registro.enviar })

describe('RegistroView', () => {
  it('muestra el título, los tres pasos y el enlace para iniciar sesión', () => {
    montar()
    expect(screen.getByRole('heading', { level: 1, name: t.registro.titulo })).toBeInTheDocument()
    expect(screen.getByText(t.registro.pasos[1]!.titulo)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: t.registro.pie.enlace })).toHaveAttribute('href', '/es/iniciar-sesion')
  })

  it('con el formulario vacío muestra los errores y lleva el foco al primer campo', async () => {
    const { alRegistrar, usuario } = montar()
    await usuario.click(crearCuenta())

    expect(alRegistrar).not.toHaveBeenCalled()
    expect(screen.getByText(t.errores.nombre)).toBeInTheDocument()
    expect(screen.getByText(t.errores.apellidos)).toBeInTheDocument()
    expect(screen.getByText(t.errores.pais)).toBeInTheDocument()
    expect(screen.getByText(t.errores.politicaRequerida)).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveFocus()
  })

  it('pide una contraseña de al menos 8 caracteres', async () => {
    const { alRegistrar, usuario } = montar()
    await rellenar(usuario, 'corta')
    await usuario.click(crearCuenta())
    expect(alRegistrar).not.toHaveBeenCalled()
    expect(screen.getByText('Usa al menos 8 caracteres.')).toBeInTheDocument()
  })

  it('ofrece los países de la lista', () => {
    montar()
    expect(screen.getByRole('option', { name: 'Perú' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Otro país' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'España' })).not.toBeInTheDocument()
  })

  it('el indicador de fortaleza cambia al escribir', async () => {
    const { usuario } = montar()
    expect(screen.getByText(t.registro.fuerza.minimo)).toBeInTheDocument()
    await usuario.type(screen.getByLabelText('Contraseña'), 'corta')
    expect(screen.getByText(t.registro.fuerza.muyCorta)).toBeInTheDocument()
    await usuario.clear(screen.getByLabelText('Contraseña'))
    await usuario.type(screen.getByLabelText('Contraseña'), 'letras123')
    expect(screen.getByText(t.registro.fuerza.buena)).toBeInTheDocument()
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

  it('envía los datos y muestra a qué correo fue el enlace', async () => {
    const { alRegistrar, usuario } = montar()
    await rellenar(usuario)
    await usuario.click(crearCuenta())

    await waitFor(() => expect(alRegistrar).toHaveBeenCalledTimes(1))
    expect(alRegistrar.mock.calls[0]?.[0]).toMatchObject({ nombre: 'Ana', apellidos: 'Pérez Rojas', pais: 'PE', correo: 'Ana@Correo.com', aceptaPolitica: true })
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
    expect(screen.getByLabelText('Nombre')).toHaveValue('Ana')
    expect(screen.getByLabelText('Correo')).toHaveFocus()
  })
})
