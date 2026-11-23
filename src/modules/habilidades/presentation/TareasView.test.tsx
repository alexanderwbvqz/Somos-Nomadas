import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ResultadoGuardar } from '../application/respuestas'
import type { Marcas } from '../domain/perfilArea'
import { es } from '../language/es'
import { TareasView } from './TareasView'

const t = es.tareas

// El hook navega con el router de Next, que no existe fuera de la app: se sustituye
const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
beforeEach(() => push.mockClear())

function montar(resultado: ResultadoGuardar | Promise<ResultadoGuardar> = { ok: true }, marcasIniciales: Marcas = {}) {
  const alGuardar = vi.fn<(entrada: { marcas: Marcas }) => Promise<ResultadoGuardar>>(async () => await resultado)
  render(
    <TareasView
      textos={es}
      marcasIniciales={marcasIniciales}
      alGuardar={alGuardar}
      barra={<p>Barra de arriba</p>}
      paso={1}
      hrefAtras="/es/habilidades"
      hrefSiguiente="/es/habilidades/profundizar"
    />,
  )
  return { alGuardar, usuario: userEvent.setup() }
}

const siguiente = () => screen.getByRole('button', { name: t.siguiente })
const grupo = (nombre: string) => screen.getByRole('button', { name: new RegExp(nombre) })
const tarea = (nombre: string) => screen.getByRole('checkbox', { name: nombre })

describe('TareasView', () => {
  it('muestra el título, el porqué, la barra fuera del <main> y el enlace para volver', () => {
    montar()
    expect(screen.getByRole('heading', { level: 1, name: t.titulo })).toBeInTheDocument()
    expect(screen.getByText(t.porQue)).toBeInTheDocument()
    expect(screen.getByText(es.comun.porQue)).toBeInTheDocument()
    expect(screen.getByText('Paso 01')).toBeInTheDocument()
    expect(screen.getByRole('main')).not.toContainElement(screen.getByText('Barra de arriba'))
    expect(screen.getByRole('link', { name: new RegExp(t.atras) })).toHaveAttribute('href', '/es/habilidades')
  })

  it('tiene los diez grupos, con nombres que no dicen de qué área son; solo el primero empieza abierto', () => {
    montar()
    const botones = screen.getAllByRole('button', { expanded: false }).concat(screen.getAllByRole('button', { expanded: true }))
    const nombres = botones.map((b) => b.textContent ?? '')
    for (const area of ['Tecnología', 'Ventas y Marketing', 'Finanzas', 'Operaciones']) {
      expect(nombres.some((n) => n.startsWith(area))).toBe(false)
    }
    expect(grupo('Definir y organizar')).toHaveAttribute('aria-expanded', 'true')
    expect(grupo('Construir con tecnología')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(10)
  })

  it('el botón de seguir empieza apagado y avisa de que hace falta una tarea', async () => {
    const { alGuardar, usuario } = montar()
    expect(siguiente()).toBeDisabled()
    expect(screen.getByText(t.minimo)).toBeInTheDocument()
    await usuario.click(siguiente())
    expect(alGuardar).not.toHaveBeenCalled()
    expect(screen.getByText('Tareas marcadas: 0 de 40')).toBeInTheDocument()
  })

  it('marcar una tarea empieza en "Una vez", sube los contadores y enciende el botón', async () => {
    const { usuario } = montar()
    await usuario.click(tarea('Definir qué construir primero y por qué'))
    expect(screen.getByRole('radio', { name: t.frecuencias.unaVez })).toBeChecked()
    expect(screen.getByText('Tareas marcadas: 1 de 40')).toBeInTheDocument()
    expect(within(grupo('Definir y organizar')).getByText('1 de 4')).toBeInTheDocument()
    expect(siguiente()).toBeEnabled()
    expect(screen.queryByText(t.minimo)).not.toBeInTheDocument()
  })

  it('se puede cambiar cuántas veces la hizo, y las opciones tienen nombre accesible con la tarea', async () => {
    const { usuario } = montar()
    await usuario.click(tarea('Entrevistar a posibles usuarios'))
    expect(screen.getByRole('group', { name: 'Cuántas veces: Entrevistar a posibles usuarios' })).toBeInTheDocument()
    await usuario.click(screen.getByRole('radio', { name: t.frecuencias.esMiTrabajo }))
    expect(screen.getByRole('radio', { name: t.frecuencias.esMiTrabajo })).toBeChecked()
    expect(screen.getByRole('radio', { name: t.frecuencias.unaVez })).not.toBeChecked()
  })

  it('desmarcar una tarea quita sus opciones y baja los contadores', async () => {
    const { usuario } = montar()
    await usuario.click(tarea('Entrevistar a posibles usuarios'))
    await usuario.click(tarea('Entrevistar a posibles usuarios'))
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.getByText('Tareas marcadas: 0 de 40')).toBeInTheDocument()
    expect(siguiente()).toBeDisabled()
  })

  it('abrir otro grupo enseña sus tareas; cerrarlo y volverlo a abrir conserva lo marcado', async () => {
    const { usuario } = montar()
    await usuario.click(grupo('Construir con tecnología'))
    expect(tarea('Programar una página web')).toBeInTheDocument()
    await usuario.click(tarea('Programar una página web'))
    await usuario.click(grupo('Construir con tecnología'))
    expect(screen.queryByRole('checkbox', { name: 'Programar una página web' })).not.toBeInTheDocument()
    expect(within(grupo('Construir con tecnología')).getByText('1 de 4')).toBeInTheDocument()
    await usuario.click(grupo('Construir con tecnología'))
    expect(tarea('Programar una página web')).toBeChecked()
  })

  it('si vuelve a este paso, enseña lo que ya había marcado y abre esos grupos', () => {
    montar({ ok: true }, { desarrolloWeb: 'esMiTrabajo', finanzasContabilidad: 'variasVeces' })
    expect(grupo('Construir con tecnología')).toHaveAttribute('aria-expanded', 'true')
    expect(grupo('Manejar el dinero')).toHaveAttribute('aria-expanded', 'true')
    expect(grupo('Vender y hacer negocios')).toHaveAttribute('aria-expanded', 'false')
    expect(tarea('Programar una página web')).toBeChecked()
    expect(screen.getByText('Tareas marcadas: 2 de 40')).toBeInTheDocument()
    expect(screen.getAllByRole('radio', { checked: true }).map((r) => r.getAttribute('value')).sort()).toEqual(['esMiTrabajo', 'variasVeces'])
    expect(siguiente()).toBeEnabled()
  })
})

describe('TareasView: guardar', () => {
  it('manda las marcas, lleva al paso siguiente una sola vez y deja el botón apagado', async () => {
    const { alGuardar, usuario } = montar()
    await usuario.click(tarea('Definir qué construir primero y por qué'))
    await usuario.click(screen.getByRole('radio', { name: t.frecuencias.variasVeces }))
    await usuario.click(siguiente())

    await waitFor(() => expect(push).toHaveBeenCalledWith('/es/habilidades/profundizar'))
    expect(alGuardar).toHaveBeenCalledWith({ marcas: { estrategiaProducto: 'variasVeces' } })
    const guardando = screen.getByRole('button', { name: t.guardando })
    expect(guardando).toBeDisabled()
    await usuario.click(guardando)
    expect(alGuardar).toHaveBeenCalledTimes(1)
    expect(push).toHaveBeenCalledTimes(1)
  })

  it('mientras el servidor responde, el botón dice que está guardando', async () => {
    let terminar: (resultado: ResultadoGuardar) => void = () => {}
    const { usuario } = montar(new Promise((resolver) => (terminar = resolver)))
    await usuario.click(tarea('Definir qué construir primero y por qué'))
    await usuario.click(siguiente())
    expect(await screen.findByRole('button', { name: t.guardando })).toBeDisabled()
    expect(push).not.toHaveBeenCalled()
    terminar({ ok: true })
    await waitFor(() => expect(push).toHaveBeenCalledTimes(1))
  })

  it('si el servidor limita los intentos, avisa y no navega', async () => {
    const { usuario } = montar({ ok: false, errores: {}, motivo: 'limite' })
    await usuario.click(tarea('Definir qué construir primero y por qué'))
    await usuario.click(siguiente())
    expect(await screen.findByRole('alert')).toHaveTextContent(t.avisos.limite)
    expect(push).not.toHaveBeenCalled()
    expect(siguiente()).toBeEnabled()
  })

  it('si no se pudo guardar, avisa, conserva lo marcado y deja intentar de nuevo', async () => {
    const { usuario } = montar({ ok: false, errores: {}, motivo: 'fallo' })
    await usuario.click(tarea('Definir qué construir primero y por qué'))
    await usuario.click(siguiente())
    expect(await screen.findByRole('alert')).toHaveTextContent(t.avisos.fallo)
    expect(tarea('Definir qué construir primero y por qué')).toBeChecked()
    expect(push).not.toHaveBeenCalled()
  })

  it('si la acción se rompe, también avisa con el mensaje de fallo', async () => {
    const alGuardar = vi.fn(async () => {
      throw new Error('x')
    })
    render(<TareasView textos={es} marcasIniciales={{ ventas: 'unaVez' }} alGuardar={alGuardar} barra={null} paso={1} hrefAtras="/es" hrefSiguiente="/es/siguiente" />)
    await userEvent.click(screen.getByRole('button', { name: t.siguiente }))
    expect(await screen.findByRole('alert')).toHaveTextContent(t.avisos.fallo)
    expect(push).not.toHaveBeenCalled()
  })
})
