import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { es } from '../language/es'
import { InicioHabilidadesView } from './InicioHabilidadesView'

const t = es.inicio

function montar(nombre?: string) {
  render(<InicioHabilidadesView textos={es} nombre={nombre} barra={<p>Barra de arriba</p>} />)
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

  it('"Tengo cosas escritas" está apagado y lleva su etiqueta "Pronto"; "de cero", la de recomendado', () => {
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

  it('muestra los tiempos y la frase de que no se publica nada sin revisar', () => {
    montar('Ana')
    expect(screen.getByText(t.caminos.cero.tiempo)).toBeInTheDocument()
    expect(screen.getByText(t.caminos.escritas.tiempo)).toBeInTheDocument()
    expect(screen.getByText(t.notaPublicar)).toBeInTheDocument()
  })

  it('"Arrancar" avisa de que el siguiente paso llega pronto, y antes no hay aviso', async () => {
    const { usuario } = montar('Ana')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: t.arrancar }))
    expect(screen.getByRole('status')).toHaveTextContent(t.proximo)
  })
})
