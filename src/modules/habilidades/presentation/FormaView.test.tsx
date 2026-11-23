import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ResultadoGuardar } from '../application/respuestas'
import { datosFormaVacios, LIMITE_SOCIO_IDEAL, type DatosForma, type EntradaForma, type ErroresForma } from '../domain/forma'
import { es } from '../language/es'
import { FormaView } from './FormaView'

const t = es.forma

// El hook navega con el router de Next, que no existe fuera de la app: se sustituye
const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
beforeEach(() => push.mockClear())

type Resultado = ResultadoGuardar<ErroresForma>

function montar(resultado: Resultado | Promise<Resultado> = { ok: true }, inicial: DatosForma = datosFormaVacios()) {
  const alGuardar = vi.fn<(entrada: EntradaForma) => Promise<Resultado>>(async () => await resultado)
  render(
    <FormaView textos={es} inicial={inicial} alGuardar={alGuardar} barra={<p>Barra de arriba</p>} paso={5} hrefAtras="/es/habilidades/historias" hrefSiguiente="/es/habilidades/listo" />,
  )
  return { alGuardar, usuario: userEvent.setup() }
}

const terminar = () => screen.getByRole('button', { name: t.terminar })
const opcion = (titulo: string) => screen.getByRole('radio', { name: new RegExp(titulo) })
const pregunta = (titulo: string) => screen.queryByRole('group', { name: titulo })
const todas = {
  dedicacion: 'masDe20',
  arranque: 'yaMismo',
  modalidad: 'remota',
  decision: 'rapido',
  riesgo: 'seguro',
  ritmo: 'intenso',
} as const

describe('FormaView', () => {
  it('muestra el título, el porqué, la barra fuera del <main>, el enlace para volver y la primera pregunta', () => {
    montar()
    expect(screen.getByRole('heading', { level: 1, name: t.titulo })).toBeInTheDocument()
    expect(screen.getByText(t.porQue)).toBeInTheDocument()
    expect(screen.getByRole('main')).not.toContainElement(screen.getByText('Barra de arriba'))
    expect(screen.getByRole('link', { name: new RegExp(t.atras) })).toHaveAttribute('href', '/es/habilidades/historias')
    expect(pregunta(t.preguntas.dedicacion)).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
    expect(screen.queryByText(/Ya respondiste/)).not.toBeInTheDocument()
    expect(screen.getByText('Paso 05')).toBeInTheDocument()
    expect(screen.getByText(es.comun.porQue)).toBeInTheDocument()
  })

  it('no nombra ninguna de las áreas mientras responde las seis preguntas', () => {
    montar()
    for (const nombre of Object.values(t.busca.areas)) expect(screen.queryByText(nombre)).not.toBeInTheDocument()
  })

  it('al elegir con el ratón pasa solo a la pregunta siguiente', async () => {
    const { usuario } = montar()
    await usuario.click(opcion('Más de 20 horas'))
    await waitFor(() => expect(pregunta(t.preguntas.arranque)).toBeInTheDocument())
    expect(screen.getByText('Ya respondiste 1 de 6')).toBeInTheDocument()
  })

  it('al elegir con el teclado se queda en la pregunta, y se pasa con «Siguiente pregunta»', async () => {
    const { usuario } = montar()
    fireEvent.click(opcion('Más de 20 horas'))
    await new Promise((resolver) => setTimeout(resolver, 400))
    expect(pregunta(t.preguntas.dedicacion)).toBeInTheDocument()
    expect(opcion('Más de 20 horas')).toBeChecked()
    await usuario.click(screen.getByRole('button', { name: t.siguientePregunta }))
    expect(pregunta(t.preguntas.arranque)).toBeInTheDocument()
  })

  it('«Saltar esta pregunta» pasa a la siguiente sin contestar, y «Anterior» vuelve (no está en la primera)', async () => {
    const { usuario } = montar()
    expect(screen.queryByRole('button', { name: new RegExp(t.anterior) })).not.toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: t.saltar }))
    expect(pregunta(t.preguntas.arranque)).toBeInTheDocument()
    expect(screen.queryByText(/Ya respondiste/)).not.toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: new RegExp(t.anterior) }))
    expect(pregunta(t.preguntas.dedicacion)).toBeInTheDocument()
  })

  it('vuelve a lo que ya contestó: empieza por la primera pregunta que falta', () => {
    montar(undefined, { respuestas: { dedicacion: 'masDe20', arranque: 'yaMismo' }, busca: [], socioIdeal: '' })
    expect(pregunta(t.preguntas.modalidad)).toBeInTheDocument()
    expect(screen.getByText('Ya respondiste 2 de 6')).toBeInTheDocument()
  })

  it('con las seis contestadas empieza en el final, que resume y deja cambiar cualquiera', async () => {
    const { usuario } = montar(undefined, { respuestas: { ...todas }, busca: [], socioIdeal: '' })
    expect(screen.getByRole('heading', { level: 2, name: 'Listo: 6 de 6' })).toBeInTheDocument()
    expect(screen.getByText(t.cambiar)).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: /Remota/ }))
    expect(pregunta(t.preguntas.modalidad)).toBeInTheDocument()
    expect(opcion('Remota')).toBeChecked()
  })

  it('en el final, y solo allí, pregunta por las áreas que busca y por el socio ideal', () => {
    montar(undefined, { respuestas: { ...todas }, busca: [], socioIdeal: '' })
    for (const nombre of Object.values(t.busca.areas)) expect(screen.getByRole('checkbox', { name: nombre })).toBeInTheDocument()
    expect(screen.getByLabelText(new RegExp(t.socio.etiqueta))).toHaveAttribute('placeholder', t.socio.ejemplo)
  })

  it('«Terminar» guarda lo contestado y las áreas, en el orden de la lista, y navega', async () => {
    const { alGuardar, usuario } = montar(undefined, { respuestas: { ...todas }, busca: [], socioIdeal: '' })
    await usuario.click(screen.getByRole('checkbox', { name: t.busca.areas.finanzas }))
    await usuario.click(screen.getByRole('checkbox', { name: t.busca.areas.tecnologia }))
    await usuario.type(screen.getByLabelText(new RegExp(t.socio.etiqueta)), 'Alguien que venda')
    await usuario.click(terminar())
    await waitFor(() => expect(push).toHaveBeenCalledWith('/es/habilidades/listo'))
    expect(alGuardar).toHaveBeenCalledWith({ respuestas: { ...todas }, busca: ['tecnologia', 'finanzas'], socioIdeal: 'Alguien que venda' })
    expect(alGuardar).toHaveBeenCalledTimes(1)
  })

  it('todo es opcional: se puede terminar sin contestar nada', async () => {
    const { alGuardar, usuario } = montar()
    await usuario.click(terminar())
    await waitFor(() => expect(push).toHaveBeenCalledWith('/es/habilidades/listo'))
    expect(alGuardar).toHaveBeenCalledWith({ respuestas: {}, busca: [], socioIdeal: '' })
  })

  it('un texto de socio demasiado largo no se guarda, avisa y lleva al final', async () => {
    const { alGuardar, usuario } = montar(undefined, { respuestas: { ...todas }, busca: [], socioIdeal: 'a'.repeat(LIMITE_SOCIO_IDEAL + 1) })
    await usuario.click(terminar())
    expect(await screen.findByText('Es demasiado largo. Máximo 800 caracteres.')).toBeInTheDocument()
    expect(alGuardar).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })

  it('si no se pudo guardar, avisa y no navega', async () => {
    const { usuario } = montar({ ok: false, errores: {}, motivo: 'fallo' })
    await usuario.click(terminar())
    expect(await screen.findByRole('alert')).toHaveTextContent(t.avisos.fallo)
    expect(push).not.toHaveBeenCalled()
  })

  it('no reenvía mientras guarda: el botón queda apagado', async () => {
    let terminarGuardado: (resultado: Resultado) => void = () => {}
    const { alGuardar, usuario } = montar(new Promise<Resultado>((resolver) => (terminarGuardado = resolver)))
    await usuario.click(terminar())
    expect(screen.getByRole('button', { name: t.guardando })).toBeDisabled()
    fireEvent.submit(screen.getByRole('button', { name: t.guardando }).closest('form')!)
    expect(alGuardar).toHaveBeenCalledTimes(1)
    terminarGuardado({ ok: true })
    await waitFor(() => expect(push).toHaveBeenCalledTimes(1))
  })
})
