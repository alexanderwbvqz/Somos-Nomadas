import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Camino } from '../domain/camino'
import { es } from '../language/es'
import { InicioHabilidadesView } from './InicioHabilidadesView'

const t = es.inicio

// El botón navega con el router de Next, que no existe fuera de la app: se sustituye
const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
beforeEach(() => push.mockClear())

function montar(nombre?: string, disponibles: readonly Camino[] = ['cero'], rutas: Partial<Record<Camino, string>> = {}) {
  render(<InicioHabilidadesView textos={es} nombre={nombre} disponibles={disponibles} rutas={rutas} barra={<p>Barra de arriba</p>} />)
  return { usuario: userEvent.setup() }
}

const cero = () => screen.getByRole('radio', { name: new RegExp(t.caminos.cero.titulo) })
const escritas = () => screen.getByRole('radio', { name: new RegExp(t.caminos.escritas.titulo) })

describe('InicioHabilidadesView', () => {
  it('saluda por el nombre y pone la barra fuera del <main>', () => {
    montar('Ana')
    expect(screen.getByRole('heading', { level: 1, name: 'Hola, Ana. Empecemos por ti.' })).toBeInTheDocument()
    expect(screen.getByText('Barra de arriba')).toBeInTheDocument()
    expect(screen.getByRole('main')).not.toContainElement(screen.getByText('Barra de arriba'))
  })

  it('sin nombre saluda sin él', () => {
    montar()
    expect(screen.getByRole('heading', { level: 1, name: t.saludoSinNombre })).toBeInTheDocument()
  })

  it('tiene los dos caminos en un grupo con nombre, y arranca marcado "de cero"', () => {
    montar('Ana')
    expect(screen.getByRole('group', { name: t.etiquetaCaminos })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(2)
    expect(cero()).toBeChecked()
    expect(escritas()).not.toBeChecked()
  })

  it('un camino que no está disponible sale apagado y con su etiqueta "Pronto"; el recomendado, la suya', () => {
    montar('Ana')
    expect(escritas()).toBeDisabled()
    expect(screen.getByText(t.caminos.escritas.etiqueta)).toHaveAttribute('data-tono', 'suave')
    expect(screen.getByText(t.caminos.cero.etiqueta)).toHaveAttribute('data-tono', 'oscuro')
  })

  it('el camino apagado no se puede elegir', async () => {
    const { usuario } = montar('Ana')
    await usuario.click(escritas())
    expect(cero()).toBeChecked()
    expect(escritas()).not.toBeChecked()
  })

  it('con los dos disponibles se puede elegir el de lo escrito', async () => {
    const { usuario } = montar('Ana', ['escritas', 'cero'])
    expect(escritas()).toBeEnabled()
    await usuario.click(escritas())
    expect(escritas()).toBeChecked()
    expect(cero()).not.toBeChecked()
  })

  it('muestra los tiempos y la frase de que no se publica nada sin revisar', () => {
    montar('Ana')
    expect(screen.getByText(t.caminos.cero.tiempo)).toBeInTheDocument()
    expect(screen.getByText(t.caminos.escritas.tiempo)).toBeInTheDocument()
    expect(screen.getByText(t.notaPublicar)).toBeInTheDocument()
  })

  it('"Arrancar" en un camino sin paso siguiente avisa de que llega pronto, y no navega', async () => {
    const { usuario } = montar('Ana')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: t.arrancar }))
    expect(screen.getByRole('status')).toHaveTextContent(es.comun.proximo)
    expect(push).not.toHaveBeenCalled()
  })

  it('"Arrancar" en un camino con ruta navega a ella', async () => {
    const { usuario } = montar('Ana', ['escritas', 'cero'], { escritas: '/es/habilidades/escritas' })
    await usuario.click(escritas())
    await usuario.click(screen.getByRole('button', { name: t.arrancar }))
    expect(push).toHaveBeenCalledWith('/es/habilidades/escritas')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('el aviso provisional desaparece al cambiar de camino', async () => {
    const { usuario } = montar('Ana', ['escritas', 'cero'])
    await usuario.click(screen.getByRole('button', { name: t.arrancar }))
    expect(screen.getByRole('status')).toBeInTheDocument()
    await usuario.click(escritas())
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
