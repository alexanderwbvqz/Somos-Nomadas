import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ResultadoGuardar } from '../application/respuestas'
import { datosHistoriasVacios, LIMITES_HISTORIAS, type DatosHistorias, type ErroresHistorias } from '../domain/historias'
import { es } from '../language/es'
import { HistoriasView } from './HistoriasView'

const t = es.historias

// El hook navega con el router de Next, que no existe fuera de la app: se sustituye
const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
beforeEach(() => push.mockClear())

type Resultado = ResultadoGuardar<ErroresHistorias>

function montar(resultado: Resultado | Promise<Resultado> = { ok: true }, inicial: DatosHistorias = datosHistoriasVacios()) {
  const alGuardar = vi.fn<(entrada: DatosHistorias) => Promise<Resultado>>(async () => await resultado)
  render(
    <HistoriasView
      textos={es}
      inicial={inicial}
      alGuardar={alGuardar}
      barra={<p>Barra de arriba</p>}
      paso={3}
      hrefAtras="/es/habilidades/profundizar"
      hrefSiguiente="/es/habilidades/forma"
      hrefInformacion="/es/politica-de-datos"
    />,
  )
  return { alGuardar, usuario: userEvent.setup() }
}

const siguiente = () => screen.getByRole('button', { name: t.siguiente })
const logro = () => screen.getByLabelText(new RegExp(t.campos.logro.etiqueta))
const permiso = () => screen.queryByRole('checkbox', { name: new RegExp(t.permiso.texto.slice(0, 25)) })
const sector = (nombre: string) => screen.getByRole('checkbox', { name: nombre })

describe('HistoriasView', () => {
  it('muestra el título, el porqué, la barra fuera del <main>, la nota y el enlace para volver', () => {
    montar()
    expect(screen.getByRole('heading', { level: 1, name: t.titulo })).toBeInTheDocument()
    expect(screen.getByText(t.porQue)).toBeInTheDocument()
    expect(screen.getByText(es.comun.porQue)).toBeInTheDocument()
    expect(screen.getByText('Paso 03')).toBeInTheDocument()
    expect(screen.getByText(t.nota)).toBeInTheDocument()
    expect(screen.getByRole('main')).not.toContainElement(screen.getByText('Barra de arriba'))
    expect(screen.getByRole('link', { name: new RegExp(t.atras) })).toHaveAttribute('href', '/es/habilidades/profundizar')
  })

  it('tiene los tres textos, todos opcionales y con un ejemplo, y los quince sectores', () => {
    montar()
    expect(logro()).toHaveAttribute('placeholder', t.campos.logro.ejemplo)
    expect(screen.getByLabelText(new RegExp(t.campos.problemaDificil.etiqueta))).toBeInTheDocument()
    expect(screen.getByLabelText(new RegExp(t.campos.problemaMundo.etiqueta))).toBeInTheDocument()
    expect(screen.getAllByText(t.opcional).length).toBeGreaterThanOrEqual(4)
    expect(screen.getAllByRole('checkbox')).toHaveLength(15)
  })

  it('la casilla del permiso aparece cuando se escribe algo y desaparece si se borra', async () => {
    const { usuario } = montar()
    expect(permiso()).not.toBeInTheDocument()
    await usuario.type(logro(), 'Armé una tienda')
    expect(permiso()).toBeInTheDocument()
    await usuario.clear(logro())
    expect(permiso()).not.toBeInTheDocument()
  })

  it('un texto solo con espacios no pide el permiso', async () => {
    const { usuario } = montar()
    await usuario.type(logro(), '   ')
    expect(permiso()).not.toBeInTheDocument()
  })

  it('la casilla enlaza a más información en una pestaña nueva', async () => {
    const { usuario } = montar()
    await usuario.type(logro(), 'x')
    const enlace = screen.getByRole('link', { name: t.permiso.enlace })
    expect(enlace).toHaveAttribute('href', '/es/politica-de-datos')
    expect(enlace).toHaveAttribute('target', '_blank')
  })
})

describe('HistoriasView: sectores', () => {
  it('deja marcar hasta cinco, desactiva el resto y lleva la cuenta', async () => {
    const { usuario } = montar()
    for (const nombre of ['Salud', 'Educación', 'Agro', 'Turismo', 'Moda']) await usuario.click(sector(nombre))
    expect(screen.getByText('5 de 5')).toBeInTheDocument()
    expect(sector('Fintech')).toBeDisabled()
    await usuario.click(sector('Agro'))
    expect(screen.getByText('4 de 5')).toBeInTheDocument()
    expect(sector('Fintech')).toBeEnabled()
  })
})

describe('HistoriasView: guardar', () => {
  it('con todo vacío se puede seguir: es opcional, y no pide permiso', async () => {
    const { alGuardar, usuario } = montar()
    await usuario.click(siguiente())
    await waitFor(() => expect(push).toHaveBeenCalledWith('/es/habilidades/forma'))
    expect(alGuardar).toHaveBeenCalledWith(datosHistoriasVacios())
  })

  it('con texto y permiso manda todo y lleva al paso siguiente una sola vez', async () => {
    const { alGuardar, usuario } = montar()
    await usuario.type(logro(), 'Armé una tienda')
    await usuario.click(sector('Moda'))
    await usuario.click(permiso()!)
    await usuario.click(siguiente())

    await waitFor(() => expect(push).toHaveBeenCalledTimes(1))
    expect(alGuardar).toHaveBeenCalledWith({ logro: 'Armé una tienda', problemaDificil: '', problemaMundo: '', sectores: ['moda'], aceptaMostrar: true })
    const guardando = screen.getByRole('button', { name: t.guardando })
    expect(guardando).toBeDisabled()
    await usuario.click(guardando)
    expect(alGuardar).toHaveBeenCalledTimes(1)
    expect(push).toHaveBeenCalledTimes(1)
  })

  it('con texto pero sin permiso no guarda, avisa en la casilla y lleva el foco a ella', async () => {
    const { alGuardar, usuario } = montar()
    await usuario.type(logro(), 'Armé una tienda')
    await usuario.click(siguiente())
    expect(alGuardar).not.toHaveBeenCalled()
    expect(screen.getByText(t.errores.faltaPermiso)).toBeInTheDocument()
    expect(permiso()).toHaveFocus()
    expect(push).not.toHaveBeenCalled()
  })

  it('el aviso del permiso desaparece al marcar la casilla y entonces sí guarda', async () => {
    const { alGuardar, usuario } = montar()
    await usuario.type(logro(), 'Armé una tienda')
    await usuario.click(siguiente())
    await usuario.click(permiso()!)
    expect(screen.queryByText(t.errores.faltaPermiso)).not.toBeInTheDocument()
    await usuario.click(siguiente())
    await waitFor(() => expect(alGuardar).toHaveBeenCalledTimes(1))
  })

  it('un texto demasiado largo avisa con el máximo y lleva el foco a su campo', async () => {
    const { alGuardar, usuario } = montar()
    fireEvent.change(logro(), { target: { value: 'a'.repeat(LIMITES_HISTORIAS.texto + 1) } })
    await usuario.click(permiso()!)
    await usuario.click(siguiente())
    expect(alGuardar).not.toHaveBeenCalled()
    expect(screen.getByText('Es demasiado largo. Máximo 1200 caracteres.')).toBeInTheDocument()
    expect(logro()).toHaveFocus()
  })

  it('si el servidor rechaza algo, lo muestra junto a su campo', async () => {
    const { usuario } = montar({ ok: false, errores: { aceptaMostrar: 'faltaPermiso' } }, { ...datosHistoriasVacios(), logro: 'Armé algo', aceptaMostrar: true })
    await usuario.click(siguiente())
    expect(await screen.findByText(t.errores.faltaPermiso)).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
  })

  it('si el servidor limita los intentos o falla, lo avisa, conserva lo escrito y deja intentar de nuevo', async () => {
    const { usuario } = montar({ ok: false, errores: {}, motivo: 'limite' })
    await usuario.type(logro(), 'Armé algo')
    await usuario.click(permiso()!)
    await usuario.click(siguiente())
    expect(await screen.findByRole('alert')).toHaveTextContent(t.avisos.limite)
    expect(logro()).toHaveValue('Armé algo')
    expect(siguiente()).toBeEnabled()
    expect(push).not.toHaveBeenCalled()
  })

  it('si la acción se rompe, avisa con el mensaje de fallo', async () => {
    const alGuardar = vi.fn(async () => {
      throw new Error('x')
    })
    render(<HistoriasView textos={es} inicial={datosHistoriasVacios()} alGuardar={alGuardar} barra={null} paso={3} hrefAtras="/es" hrefSiguiente="/es/siguiente" hrefInformacion="/es/info" />)
    await userEvent.click(screen.getByRole('button', { name: t.siguiente }))
    expect(await screen.findByRole('alert')).toHaveTextContent(t.avisos.fallo)
    expect(push).not.toHaveBeenCalled()
  })

  it('si vuelve a este paso, enseña lo que ya había escrito, con el permiso dado y los sectores marcados', () => {
    montar({ ok: true }, { logro: 'Armé una tienda', problemaDificil: '', problemaMundo: 'El crédito', sectores: ['fintech', 'moda'], aceptaMostrar: true })
    expect(logro()).toHaveValue('Armé una tienda')
    expect(permiso()).toBeChecked()
    expect(sector('Fintech')).toBeChecked()
    expect(sector('Moda')).toBeChecked()
    expect(screen.getByText('2 de 5')).toBeInTheDocument()
  })
})
