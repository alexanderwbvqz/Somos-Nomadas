import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ResultadoBienvenida } from '../application/guardarBienvenida'
import type { DatosBienvenida } from '../domain/perfil'
import { es } from '../language/es'
import { BienvenidaView } from './BienvenidaView'

const t = es.bienvenida

function montar(resultado: ResultadoBienvenida = { ok: true, nombre: 'Ana' }) {
  const alGuardar = vi.fn<(datos: DatosBienvenida) => Promise<ResultadoBienvenida>>(async () => resultado)
  render(<BienvenidaView textos={es} alGuardar={alGuardar} hrefInicio="/es" />)
  return { alGuardar, usuario: userEvent.setup() }
}

const enviar = () => screen.getByRole('button', { name: t.enviar })

async function rellenar(usuario: ReturnType<typeof userEvent.setup>) {
  await usuario.type(screen.getByLabelText('Nombre'), 'Ana')
  await usuario.type(screen.getByLabelText('Apellidos'), 'Torres Rojas')
  await usuario.click(screen.getByRole('combobox', { name: t.campos.pais }))
  await usuario.click(screen.getByRole('option', { name: 'Perú' }))
  await usuario.click(screen.getByRole('checkbox', { name: t.busca.opciones.socioTecnico }))
}

describe('BienvenidaView', () => {
  it('muestra el paso, el título y los campos', () => {
    montar()
    expect(screen.getByRole('heading', { level: 1, name: t.titulo })).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Paso 1 de 2' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: t.campos.pais })).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox')).toHaveLength(5)
  })

  it('con el formulario vacío avisa de lo que falta y lleva el foco al nombre', async () => {
    const { alGuardar, usuario } = montar()
    await usuario.click(enviar())
    expect(alGuardar).not.toHaveBeenCalled()
    expect(screen.getByText(t.errores.nombre)).toBeInTheDocument()
    expect(screen.getByText(t.errores.apellidos)).toBeInTheDocument()
    expect(screen.getByText(t.errores.pais)).toBeInTheDocument()
    expect(screen.getByText(t.errores.busquedaVacia)).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveFocus()
  })

  it('la ciudad es opcional: se guarda sin ella', async () => {
    const { alGuardar, usuario } = montar()
    await rellenar(usuario)
    await usuario.click(enviar())
    await waitFor(() => expect(alGuardar).toHaveBeenCalledWith({ nombre: 'Ana', apellidos: 'Torres Rojas', pais: 'PE', ciudad: '', busca: ['socioTecnico'] }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Listo, Ana' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: t.listo.volver })).toHaveAttribute('href', '/es')
  })

  it('manda la ciudad cuando se escribe', async () => {
    const { alGuardar, usuario } = montar()
    await rellenar(usuario)
    await usuario.type(screen.getByLabelText(/Ciudad/), 'Lima')
    await usuario.click(enviar())
    await waitFor(() => expect(alGuardar).toHaveBeenCalledWith(expect.objectContaining({ ciudad: 'Lima' })))
  })

  it('deja marcar hasta cuatro opciones y desactiva la quinta', async () => {
    const { usuario } = montar()
    for (const clave of ['socioTecnico', 'socioComercial', 'alguienConIdea', 'sumarmeAIdea'] as const) {
      await usuario.click(screen.getByRole('checkbox', { name: t.busca.opciones[clave] }))
    }
    expect(screen.getByRole('checkbox', { name: t.busca.opciones.explorando })).toBeDisabled()
    await usuario.click(screen.getByRole('checkbox', { name: t.busca.opciones.socioComercial }))
    expect(screen.getByRole('checkbox', { name: t.busca.opciones.explorando })).toBeEnabled()
  })

  it('un error corregido desaparece al corregirlo', async () => {
    const { usuario } = montar()
    await usuario.click(enviar())
    await usuario.type(screen.getByLabelText('Nombre'), 'Ana')
    expect(screen.queryByText(t.errores.nombre)).not.toBeInTheDocument()
    expect(screen.getByText(t.errores.apellidos)).toBeInTheDocument()
  })

  it('si el servidor limita los intentos o falla, lo avisa y deja intentar de nuevo', async () => {
    const { usuario } = montar({ ok: false, errores: {}, motivo: 'limite' })
    await rellenar(usuario)
    await usuario.click(enviar())
    expect(await screen.findByRole('alert')).toHaveTextContent(t.avisos.limite)
    expect(screen.getByLabelText('Nombre')).toHaveValue('Ana')
  })

  it('si el servidor devuelve errores de datos, los muestra junto a su campo', async () => {
    const { usuario } = montar({ ok: false, errores: { apellidos: 'textoLargo' } })
    await rellenar(usuario)
    await usuario.click(enviar())
    expect(await screen.findByText(t.errores.textoLargo)).toBeInTheDocument()
    expect(screen.getByLabelText('Apellidos')).toHaveFocus()
  })
})
