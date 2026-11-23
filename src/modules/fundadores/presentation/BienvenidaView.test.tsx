import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ResultadoBienvenida } from '../application/guardarBienvenida'
import type { DatosBienvenida } from '../domain/perfil'
import { es } from '../language/es'
import { BienvenidaView } from './BienvenidaView'

const t = es.bienvenida

// El hook navega con el router de Next, que no existe fuera de la app: se sustituye
const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
beforeEach(() => push.mockClear())

function montar(resultado: ResultadoBienvenida = { ok: true, nombre: 'Ana' }) {
  const alGuardar = vi.fn<(datos: DatosBienvenida) => Promise<ResultadoBienvenida>>(async () => resultado)
  render(<BienvenidaView textos={es} alGuardar={alGuardar} hrefSiguiente="/es/habilidades" barra={<p>Barra de arriba</p>} />)
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
  it('muestra su barra, el título y los campos dentro de <main>', () => {
    montar()
    expect(screen.getByText('Barra de arriba')).toBeInTheDocument()
    expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { level: 1, name: t.titulo }))
    expect(screen.getByRole('main')).not.toContainElement(screen.getByText('Barra de arriba'))
    expect(screen.getByRole('combobox', { name: t.campos.pais })).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox')).toHaveLength(5)
  })

  it('el botón empieza apagado y no envía nada', async () => {
    const { alGuardar, usuario } = montar()
    expect(enviar()).toBeDisabled()
    await usuario.click(enviar())
    expect(alGuardar).not.toHaveBeenCalled()
  })

  it('se enciende al completar nombre, apellidos, país y una opción, y se apaga si se vacía un campo', async () => {
    const { usuario } = montar()
    await rellenar(usuario)
    expect(enviar()).toBeEnabled()
    await usuario.clear(screen.getByLabelText('Nombre'))
    expect(enviar()).toBeDisabled()
  })

  it('con todo menos una cosa sigue apagado', async () => {
    const { usuario } = montar()
    await usuario.type(screen.getByLabelText('Nombre'), 'Ana')
    await usuario.type(screen.getByLabelText('Apellidos'), 'Torres Rojas')
    await usuario.click(screen.getByRole('checkbox', { name: t.busca.opciones.socioTecnico }))
    expect(enviar()).toBeDisabled() // falta el país
  })

  it('la ciudad es opcional: se guarda sin ella', async () => {
    const { alGuardar, usuario } = montar()
    await rellenar(usuario)
    await usuario.click(enviar())
    await waitFor(() => expect(alGuardar).toHaveBeenCalledWith({ nombre: 'Ana', apellidos: 'Torres Rojas', pais: 'PE', ciudad: '', busca: ['socioTecnico'] }))
    await waitFor(() => expect(push).toHaveBeenCalledWith('/es/habilidades'))
  })

  it('al guardar lleva al paso siguiente una sola vez y deja el botón apagado', async () => {
    const { alGuardar, usuario } = montar()
    await rellenar(usuario)
    await usuario.click(enviar())
    await waitFor(() => expect(push).toHaveBeenCalledTimes(1))
    // Mientras se va al paso siguiente el botón sigue apagado y dice que está guardando
    const guardando = screen.getByRole('button', { name: t.enviando })
    expect(guardando).toBeDisabled()
    await usuario.click(guardando)
    expect(alGuardar).toHaveBeenCalledTimes(1)
    expect(push).toHaveBeenCalledTimes(1)
  })

  it('si el servidor no guarda, no navega', async () => {
    const { usuario } = montar({ ok: false, errores: {}, motivo: 'fallo' })
    await rellenar(usuario)
    await usuario.click(enviar())
    expect(await screen.findByRole('alert')).toHaveTextContent(t.avisos.fallo)
    expect(push).not.toHaveBeenCalled()
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

  it('un error que devolvió el servidor desaparece al corregir ese campo', async () => {
    const { usuario } = montar({ ok: false, errores: { apellidos: 'textoLargo' } })
    await rellenar(usuario)
    await usuario.click(enviar())
    expect(await screen.findByText(t.errores.textoLargo)).toBeInTheDocument()
    await usuario.type(screen.getByLabelText('Apellidos'), 'x')
    expect(screen.queryByText(t.errores.textoLargo)).not.toBeInTheDocument()
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
