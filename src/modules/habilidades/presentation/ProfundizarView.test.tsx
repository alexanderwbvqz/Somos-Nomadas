import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ErroresGuardarProfundizacion, ResultadoGuardar } from '../application/respuestas'
import type { HabilidadId } from '../domain/catalogo'
import type { Marcas } from '../domain/perfilArea'
import type { RespuestasProfundizacion } from '../domain/preguntas'
import { es } from '../language/es'
import { ProfundizarView } from './ProfundizarView'

const t = es.profundizar

// El hook navega con el router de Next, que no existe fuera de la app: se sustituye
const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
beforeEach(() => push.mockClear())

type Resultado = ResultadoGuardar<ErroresGuardarProfundizacion>

const habilidades: HabilidadId[] = ['desarrolloWeb', 'ciberseguridad', 'ventas']
const marcas: Marcas = { desarrolloWeb: 'esMiTrabajo', ciberseguridad: 'variasVeces', ventas: 'unaVez' }

function montar(opciones: { resultado?: (habilidad: HabilidadId) => Resultado; contadas?: Partial<Record<HabilidadId, RespuestasProfundizacion>>; lista?: HabilidadId[] } = {}) {
  const alGuardar = vi.fn<(entrada: { habilidad: HabilidadId; respuestas: RespuestasProfundizacion }) => Promise<Resultado>>(async ({ habilidad }) => opciones.resultado?.(habilidad) ?? { ok: true })
  render(
    <ProfundizarView
      textos={es}
      habilidades={opciones.lista ?? habilidades}
      marcas={marcas}
      contadasIniciales={opciones.contadas ?? {}}
      alGuardar={alGuardar}
      barra={<p>Barra de arriba</p>}
      hrefAtras="/es/habilidades/tareas"
      hrefSiguiente="/es/habilidades/historias"
    />,
  )
  return { alGuardar, usuario: userEvent.setup() }
}

// El título de cada sección empieza por «Habilidad n de total»: así no se confunde con «Listo, siguiente habilidad: …»
const seccion = (nombre: string) => screen.getByRole('button', { name: new RegExp(`^Habilidad \\d de \\d.*${nombre}`) })
const siguiente = () => screen.getByRole('button', { name: t.siguiente })

describe('ProfundizarView', () => {
  it('muestra el título, la razón, la barra fuera del <main> y el enlace para volver', () => {
    montar()
    expect(screen.getByRole('heading', { level: 1, name: t.titulo })).toBeInTheDocument()
    expect(screen.getByText(t.porQue)).toBeInTheDocument()
    expect(screen.getByRole('main')).not.toContainElement(screen.getByText('Barra de arriba'))
    expect(screen.getByRole('link', { name: new RegExp(t.atras) })).toHaveAttribute('href', '/es/habilidades/tareas')
  })

  it('hace una sección por habilidad, con su número y cuántas veces la hizo, y no enseña ningún área', () => {
    montar()
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3)
    expect(seccion('Desarrollo web')).toHaveTextContent('Habilidad 1 de 3 · lo has hecho: es mi trabajo')
    expect(seccion('Ciberseguridad')).toHaveTextContent('Habilidad 2 de 3 · lo has hecho: varias veces')
    expect(seccion('Ventas')).toHaveTextContent('Habilidad 3 de 3 · lo has hecho: una vez')
    for (const area of ['Tecnología', 'Finanzas', 'Operaciones']) expect(screen.queryByText(area)).not.toBeInTheDocument()
  })

  it('empieza con la primera abierta y todas pendientes', () => {
    montar()
    expect(seccion('Desarrollo web')).toHaveAttribute('aria-expanded', 'true')
    expect(seccion('Ciberseguridad')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getAllByText(t.pendiente)).toHaveLength(3)
  })

  it('es un acordeón: abrir una cierra la otra', async () => {
    const { usuario } = montar()
    await usuario.click(seccion('Ciberseguridad'))
    expect(seccion('Ciberseguridad')).toHaveAttribute('aria-expanded', 'true')
    expect(seccion('Desarrollo web')).toHaveAttribute('aria-expanded', 'false')
    await usuario.click(seccion('Ciberseguridad'))
    expect(seccion('Ciberseguridad')).toHaveAttribute('aria-expanded', 'false')
  })

  it('cada pregunta nombra su habilidad; las habilidades con preguntas propias las usan', async () => {
    const { usuario } = montar()
    expect(screen.getByText('¿Con qué tecnologías trabajas?')).toBeInTheDocument()
    expect(screen.getByText('¿Cuánto tiempo llevas con desarrollo web?')).toBeInTheDocument()
    await usuario.click(seccion('Ciberseguridad'))
    expect(screen.getByText('¿Para quién has trabajado en ciberseguridad?')).toBeInTheDocument()
    expect(screen.queryByText('¿Con qué tecnologías trabajas?')).not.toBeInTheDocument()
  })

  it('una pregunta de elegir una deja una sola; una de varias deja varias y se desmarcan', async () => {
    const { usuario } = montar()
    await usuario.click(screen.getByRole('radio', { name: 'Ambas' }))
    await usuario.click(screen.getByRole('radio', { name: 'La parte del servidor' }))
    expect(screen.getByRole('radio', { name: 'La parte del servidor' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Ambas' })).not.toBeChecked()

    await usuario.click(screen.getByRole('checkbox', { name: 'React' }))
    await usuario.click(screen.getByRole('checkbox', { name: 'Node.js' }))
    expect(screen.getByRole('checkbox', { name: 'React' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Node.js' })).toBeChecked()
    await usuario.click(screen.getByRole('checkbox', { name: 'React' }))
    expect(screen.getByRole('checkbox', { name: 'React' })).not.toBeChecked()
  })

  it('al contestar cuánto tiempo lleva, la sección pasa a "Lista" y, cerrada, resume lo contestado', async () => {
    const { usuario } = montar()
    await usuario.click(screen.getByRole('checkbox', { name: 'React' }))
    await usuario.click(screen.getByRole('radio', { name: '3 a 5 años' }))
    expect(seccion('Desarrollo web')).toHaveTextContent(`✓ ${t.lista}`)
    await usuario.click(seccion('Ciberseguridad'))
    expect(screen.getByText('React · 3 a 5 años')).toBeInTheDocument()
  })

  it('"Listo, siguiente habilidad" abre la siguiente y lleva el foco a su título; la última no lo tiene', async () => {
    const { usuario } = montar()
    await usuario.click(screen.getByRole('button', { name: 'Listo, siguiente habilidad: Ciberseguridad' }))
    expect(seccion('Ciberseguridad')).toHaveAttribute('aria-expanded', 'true')
    expect(seccion('Ciberseguridad')).toHaveFocus()
    await usuario.click(screen.getByRole('button', { name: 'Listo, siguiente habilidad: Ventas' }))
    expect(seccion('Ventas')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.queryByRole('button', { name: /Listo, siguiente habilidad/ })).not.toBeInTheDocument()
  })

  it('el texto es opcional, tiene un ejemplo y deja escribir', async () => {
    const { usuario } = montar()
    const texto = screen.getByLabelText(/Cuéntanos algo que hayas construido/)
    expect(texto).toHaveAttribute('placeholder', 'Por ejemplo: la página de una tienda en línea con carrito de compras…')
    expect(within(texto.closest('div') as HTMLElement).getByText(t.opcional)).toBeInTheDocument()
    await usuario.type(texto, 'Una tienda')
    expect(texto).toHaveValue('Una tienda')
  })

  it('si vuelve a este paso, enseña lo que ya había contado y abre la primera que falta', () => {
    montar({ contadas: { desarrolloWeb: { tiempo: 'masDeCincoAnos', tecnologias: ['react'] } } })
    expect(seccion('Desarrollo web')).toHaveAttribute('aria-expanded', 'false')
    expect(seccion('Desarrollo web')).toHaveTextContent(`✓ ${t.lista}`)
    expect(seccion('Ciberseguridad')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('React · Más de 5 años')).toBeInTheDocument()
  })
})

describe('ProfundizarView: guardar', () => {
  it('guarda cada habilidad con lo que quedó en pantalla, sin las respuestas vacías, y lleva al paso siguiente una sola vez', async () => {
    const { alGuardar, usuario } = montar()
    await usuario.click(screen.getByRole('radio', { name: 'Ambas' }))
    await usuario.click(screen.getByRole('checkbox', { name: 'React' }))
    await usuario.click(screen.getByRole('checkbox', { name: 'React' }))
    await usuario.type(screen.getByLabelText(/Cuéntanos algo que hayas construido/), '   ')
    await usuario.click(siguiente())

    await waitFor(() => expect(push).toHaveBeenCalledWith('/es/habilidades/historias'))
    expect(alGuardar.mock.calls.map(([entrada]) => entrada.habilidad)).toEqual(['desarrolloWeb', 'ciberseguridad', 'ventas'])
    expect(alGuardar.mock.calls[0]?.[0].respuestas).toEqual({ parte: 'ambas' })
    expect(alGuardar.mock.calls[1]?.[0].respuestas).toEqual({})
    const guardando = screen.getByRole('button', { name: t.guardando })
    expect(guardando).toBeDisabled()
    await usuario.click(guardando)
    expect(push).toHaveBeenCalledTimes(1)
    expect(alGuardar).toHaveBeenCalledTimes(3)
  })

  it('se puede seguir sin contar nada: es opcional', async () => {
    const { alGuardar, usuario } = montar()
    expect(siguiente()).toBeEnabled()
    await usuario.click(siguiente())
    await waitFor(() => expect(push).toHaveBeenCalledTimes(1))
    expect(alGuardar.mock.calls.every(([entrada]) => Object.keys(entrada.respuestas).length === 0)).toBe(true)
  })

  it('si falla el guardado de una habilidad, se detiene, avisa y no navega', async () => {
    const { alGuardar, usuario } = montar({ resultado: (habilidad) => (habilidad === 'ciberseguridad' ? { ok: false, errores: {}, motivo: 'fallo' } : { ok: true }) })
    await usuario.click(siguiente())
    expect(await screen.findByRole('alert')).toHaveTextContent(t.avisos.fallo)
    expect(alGuardar).toHaveBeenCalledTimes(2)
    expect(push).not.toHaveBeenCalled()
    expect(siguiente()).toBeEnabled()
  })

  it('si el servidor limita los intentos, lo avisa', async () => {
    const { usuario } = montar({ resultado: () => ({ ok: false, errores: {}, motivo: 'limite' }) })
    await usuario.click(siguiente())
    expect(await screen.findByRole('alert')).toHaveTextContent(t.avisos.limite)
    expect(push).not.toHaveBeenCalled()
  })

  it('si el servidor dice que la habilidad ya no es de las más fuertes, avisa de que no se pudo guardar', async () => {
    const { usuario } = montar({ resultado: () => ({ ok: false, errores: { habilidad: 'noEsFuerte' } }) })
    await usuario.click(siguiente())
    expect(await screen.findByRole('alert')).toHaveTextContent(t.avisos.fallo)
  })
})

describe('ProfundizarView: sin habilidades', () => {
  it('si no marcó ninguna tarea, lo dice y deja volver; no hay formulario', () => {
    montar({ lista: [] })
    expect(screen.getByText(t.vacio)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: new RegExp(t.volverATareas) })).toHaveAttribute('href', '/es/habilidades/tareas')
    expect(screen.queryByRole('button', { name: t.siguiente })).not.toBeInTheDocument()
  })
})
