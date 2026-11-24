import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ResultadoPostulacion } from '@/modules/aliados/application/enviarPostulacion'
import type { DatosPostulacion } from '@/modules/aliados/domain/postulacion'
import { es } from '@/modules/aliados/language/es'
import { FormularioPostulacion } from './FormularioPostulacion'

const t = es.postulacion
const veinte = Array.from({ length: 20 }, (_, i) => `palabra${i}`).join(' ')

function montar(resultado: ResultadoPostulacion = { ok: true }) {
  const alEnviar = vi.fn<(datos: DatosPostulacion) => Promise<ResultadoPostulacion>>(async () => resultado)
  render(<FormularioPostulacion textos={t} alEnviar={alEnviar} hrefAliados="/es/aliados" hrefPolitica="/es/politica-de-datos" />)
  return { alEnviar, usuario: userEvent.setup() }
}

type Usuario = ReturnType<typeof userEvent.setup>

async function escribir(usuario: Usuario, etiqueta: string | RegExp, texto: string) {
  const campo = screen.getByLabelText(etiqueta)
  await usuario.click(campo)
  await usuario.paste(texto)
}

async function completarPasos1a3(usuario: Usuario) {
  await usuario.click(screen.getByRole('radio', { name: /Mentor/ }))
  await escribir(usuario, t.quien.nombre, 'Ana Mentora')
  await escribir(usuario, new RegExp(`^${t.quien.persona}`), 'Ana Pérez')
  await escribir(usuario, new RegExp(`^${t.quien.correo}`), 'ana@correo.com')
  await usuario.click(screen.getByRole('button', { name: t.formulario.siguiente }))

  await escribir(usuario, t.aporte.corta, veinte)
  await usuario.click(screen.getByRole('button', { name: t.formulario.siguiente }))

  await escribir(usuario, t.contacto.agenda, 'cal.com/ana')
  await usuario.click(screen.getByRole('button', { name: t.formulario.siguiente }))
}

describe('FormularioPostulacion', () => {
  it('empieza en el paso 1 con la vista previa vacía', () => {
    montar()
    expect(screen.getByRole('heading', { level: 2, name: t.quien.titulo })).toBeInTheDocument()
    expect(screen.getByText(t.vista.sinDescripcion)).toBeInTheDocument()
    expect(screen.getByText(/0 de 5 listos/)).toBeInTheDocument()
  })

  it('no deja avanzar con el paso 1 vacío y lleva el foco al primer campo con error', async () => {
    const { usuario } = montar()
    await usuario.click(screen.getByRole('button', { name: t.formulario.siguiente }))

    expect(screen.getByRole('heading', { level: 2, name: t.quien.titulo })).toBeInTheDocument()
    expect(screen.getAllByText(t.errores.obligatorio).length).toBeGreaterThan(0)
    expect(screen.getByRole('alert')).toHaveTextContent(t.formulario.avisoErrores)
    expect(screen.getAllByRole('radio')[0]).toHaveFocus()
  })

  it('la vista previa se va llenando al escribir', async () => {
    const { usuario } = montar()
    await usuario.click(screen.getByRole('radio', { name: /Organizador/ }))
    await escribir(usuario, t.quien.nombre, 'Cowork Plaza')

    const aside = screen.getByRole('complementary', { hidden: true })
    expect(within(aside).getAllByText('Cowork Plaza').length).toBeGreaterThan(0)
    expect(within(aside).getByText('Organizador')).toBeInTheDocument()
    expect(screen.getByText(/1 de 5 listos/)).toBeInTheDocument()
  })

  it('recorre los cuatro pasos y envía los datos', async () => {
    const { alEnviar, usuario } = montar()
    await completarPasos1a3(usuario)

    expect(screen.getByRole('heading', { level: 2, name: t.enviar.titulo })).toBeInTheDocument()
    await usuario.click(screen.getByRole('checkbox', { name: new RegExp(t.enviar.politicaInicio) }))
    await usuario.click(screen.getByRole('button', { name: t.formulario.enviar }))

    await waitFor(() => expect(alEnviar).toHaveBeenCalledTimes(1))
    expect(alEnviar.mock.calls[0]?.[0]).toMatchObject({ tipo: 'mentores', nombre: 'Ana Mentora', correo: 'ana@correo.com', enlaceAgenda: 'cal.com/ana', aceptaPolitica: true })
    expect(await screen.findByRole('heading', { name: t.confirmacion.titulo })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: t.confirmacion.volver })).toHaveAttribute('href', '/es/aliados')
  })

  it('exige aceptar la política antes de enviar', async () => {
    const { alEnviar, usuario } = montar()
    await completarPasos1a3(usuario)
    await usuario.click(screen.getByRole('button', { name: t.formulario.enviar }))

    expect(alEnviar).not.toHaveBeenCalled()
    expect(screen.getByText(t.errores.politicaRequerida)).toBeInTheDocument()
  })

  it('en el paso 3 pide al menos un contacto y el consentimiento si hay WhatsApp', async () => {
    const { usuario } = montar()
    await usuario.click(screen.getByRole('radio', { name: /Mentor/ }))
    await escribir(usuario, t.quien.nombre, 'Ana')
    await escribir(usuario, new RegExp(`^${t.quien.persona}`), 'Ana')
    await escribir(usuario, new RegExp(`^${t.quien.correo}`), 'ana@correo.com')
    await usuario.click(screen.getByRole('button', { name: t.formulario.siguiente }))
    await escribir(usuario, t.aporte.corta, veinte)
    await usuario.click(screen.getByRole('button', { name: t.formulario.siguiente }))

    await usuario.click(screen.getByRole('button', { name: t.formulario.siguiente }))
    expect(screen.getByText(t.errores.contactoRequerido)).toBeInTheDocument()

    await escribir(usuario, t.contacto.whatsapp, '+51 973 356 545')
    await usuario.click(screen.getByRole('button', { name: t.formulario.siguiente }))
    expect(screen.getByText(t.errores.consentimientoWhatsapp)).toBeInTheDocument()

    await usuario.click(screen.getByRole('checkbox', { name: /WhatsApp/ }))
    await usuario.click(screen.getByRole('button', { name: t.formulario.siguiente }))
    expect(screen.getByRole('heading', { level: 2, name: t.enviar.titulo })).toBeInTheDocument()
  })

  it('el resumen permite volver a un paso para corregir', async () => {
    const { usuario } = montar()
    await completarPasos1a3(usuario)
    await usuario.click(screen.getAllByRole('button', { name: new RegExp(`^${t.enviar.editar}:`) })[0]!)
    expect(screen.getByRole('heading', { level: 2, name: t.quien.titulo })).toBeInTheDocument()
  })

  it('muestra el aviso si el servidor no pudo guardar', async () => {
    const { usuario } = montar({ ok: false, errores: {}, motivo: 'fallo' })
    await completarPasos1a3(usuario)
    await usuario.click(screen.getByRole('checkbox', { name: new RegExp(t.enviar.politicaInicio) }))
    await usuario.click(screen.getByRole('button', { name: t.formulario.enviar }))

    expect(await screen.findByText(t.formulario.envio.fallo)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: t.confirmacion.titulo })).not.toBeInTheDocument()
  })

  it('el campo trampa existe, está oculto a lectores y fuera del orden de tabulación', async () => {
    const { usuario } = montar()
    await completarPasos1a3(usuario)
    const trampa = document.querySelector<HTMLInputElement>('input[name="sitio-secundario"]')
    expect(trampa).not.toBeNull()
    expect(trampa?.tabIndex).toBe(-1)
    expect(trampa?.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('la barra del móvil abre y cierra la hoja de la vista previa', async () => {
    const { usuario } = montar()
    const barra = screen.getByRole('button', { name: /Tu perfil/ })
    expect(barra).toHaveAttribute('aria-expanded', 'false')
    await usuario.click(barra)
    expect(barra).toHaveAttribute('aria-expanded', 'true')
    await usuario.keyboard('{Escape}')
    expect(barra).toHaveAttribute('aria-expanded', 'false')
  })
})
