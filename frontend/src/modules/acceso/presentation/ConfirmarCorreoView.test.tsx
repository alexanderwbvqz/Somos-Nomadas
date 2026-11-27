import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ResultadoConfirmacion } from '../application/confirmarCorreo'
import type { ResultadoReenvio } from '../application/reenviarConfirmacion'
import { es } from '../language/es'
import { ConfirmarCorreoView } from './ConfirmarCorreoView'
import { tokenDeLaDireccion } from './hooks/useConfirmarCorreo'

// Al quedar dentro, la vista cambia de página con el enrutador de Next: aquí se reemplaza por uno falso
const enrutador = vi.hoisted(() => ({ replace: vi.fn<(href: string) => void>() }))
vi.mock('next/navigation', () => ({ useRouter: () => enrutador }))
beforeEach(() => enrutador.replace.mockClear())

const t = es
const TOKEN = 'kVmM4x6ra2TdRrgU23duyfSBxrvhOwiN71QK2GzTuZ8'

function abrir(direccion: string) {
  window.history.replaceState(null, '', direccion)
}

function montar(resultado: ResultadoConfirmacion = { ok: true, correo: 'ana@correo.com', dentro: false }, { estricto = false } = {}) {
  const alConfirmar = vi.fn<(token: string) => Promise<ResultadoConfirmacion>>(async () => resultado)
  const alReenviar = vi.fn<(correo: string) => Promise<ResultadoReenvio>>(async () => ({ ok: true }))
  const vista = <ConfirmarCorreoView textos={t} alConfirmar={alConfirmar} alReenviar={alReenviar} hrefInicioSesion="/es/iniciar-sesion" hrefContinuar="/es/bienvenida" />
  render(estricto ? <StrictMode>{vista}</StrictMode> : vista)
  return { alConfirmar, alReenviar, usuario: userEvent.setup() }
}

afterEach(() => abrir('/'))

/** El fondo del icono decorativo que encabeza la página: dice qué estado se está mostrando */
const fondoDelIcono = () => document.querySelector('[aria-hidden="true"].rounded-full')?.className.match(/\bbg-[\w-]+/)?.[0]

describe('ConfirmarCorreoView: el icono de cada estado', () => {
  it('confirmando lleva el reloj, confirmado el ✓ y un enlace que no vale el aviso', async () => {
    abrir(`/es/confirmar-correo#token=${TOKEN}`)
    let terminar: (r: ResultadoConfirmacion) => void = () => undefined
    const alConfirmar = vi.fn(() => new Promise<ResultadoConfirmacion>((resolver) => (terminar = resolver)))
    render(<ConfirmarCorreoView textos={t} alConfirmar={alConfirmar} alReenviar={vi.fn()} hrefInicioSesion="/es/iniciar-sesion" hrefContinuar="/es/bienvenida" />)

    expect(fondoDelIcono()).toBe('bg-suave')
    await waitFor(() => expect(alConfirmar).toHaveBeenCalled())
    terminar({ ok: true, correo: 'ana@correo.com', dentro: false })
    await screen.findByRole('heading', { level: 1, name: t.confirmar.confirmado.titulo })
    expect(fondoDelIcono()).toBe('bg-degradado-amarillo')
  })

  it.each([
    ['invalido', t.confirmar.invalido.titulo],
    ['limite', t.confirmar.error.titulo],
    ['fallo', t.confirmar.error.titulo],
  ] as const)('%s lleva el icono de aviso', async (motivo, titulo) => {
    abrir(`/es/confirmar-correo#token=${TOKEN}`)
    montar({ ok: false, motivo })

    await screen.findByRole('heading', { level: 1, name: titulo })
    expect(fondoDelIcono()).toBe('bg-degradado-durazno')
  })

  it('sin enlace también lleva el icono de aviso', async () => {
    abrir('/es/confirmar-correo')
    montar()

    await screen.findByRole('heading', { level: 1, name: t.confirmar.sinEnlace.titulo })
    expect(fondoDelIcono()).toBe('bg-degradado-durazno')
  })
})

describe('tokenDeLaDireccion', () => {
  it('lee el token de lo que va tras «#»', () => {
    expect(tokenDeLaDireccion(`#token=${TOKEN}`)).toBe(TOKEN)
    expect(tokenDeLaDireccion(`#otro=1&token=${TOKEN}`)).toBe(TOKEN)
  })

  it('sin token, o con el token vacío, no hay token', () => {
    expect(tokenDeLaDireccion('')).toBeUndefined()
    expect(tokenDeLaDireccion('#')).toBeUndefined()
    expect(tokenDeLaDireccion('#token=')).toBeUndefined()
    expect(tokenDeLaDireccion('#otra=cosa')).toBeUndefined()
  })
})

describe('ConfirmarCorreoView', () => {
  it('confirma con el token del enlace y lleva a iniciar sesión', async () => {
    abrir(`/es/confirmar-correo#token=${TOKEN}`)
    const { alConfirmar } = montar()

    expect(await screen.findByRole('heading', { level: 1, name: t.confirmar.confirmado.titulo })).toBeInTheDocument()
    expect(alConfirmar).toHaveBeenCalledExactlyOnceWith(TOKEN)
    expect(screen.getByText(/ana@correo\.com quedó confirmado/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: t.confirmar.confirmado.boton })).toHaveAttribute('href', '/es/iniciar-sesion')
    expect(enrutador.replace).not.toHaveBeenCalled()
  })

  it('si además quedó dentro (mismo navegador), lleva directo a la bienvenida sin pantalla intermedia', async () => {
    abrir(`/es/confirmar-correo#token=${TOKEN}`)
    const { alConfirmar } = montar({ ok: true, correo: 'ana@correo.com', dentro: true })

    await waitFor(() => expect(enrutador.replace).toHaveBeenCalledExactlyOnceWith('/es/bienvenida'))
    expect(alConfirmar).toHaveBeenCalledTimes(1)
    // Mientras cambia de página sigue el «Confirmando…»: no aparece «Correo confirmado» ni su botón
    expect(screen.getByRole('heading', { level: 1, name: t.confirmar.confirmando })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1, name: t.confirmar.confirmado.titulo })).not.toBeInTheDocument()
  })

  it('en modo estricto, quedar dentro también cambia de página una sola vez', async () => {
    abrir(`/es/confirmar-correo#token=${TOKEN}`)
    montar({ ok: true, correo: 'ana@correo.com', dentro: true }, { estricto: true })

    await waitFor(() => expect(enrutador.replace).toHaveBeenCalled())
    expect(enrutador.replace).toHaveBeenCalledTimes(1)
  })

  it('borra el token de la barra de direcciones en cuanto lo lee', async () => {
    abrir(`/es/confirmar-correo?x=1#token=${TOKEN}`)
    montar()

    await waitFor(() => expect(window.location.hash).toBe(''))
    expect(window.location.pathname + window.location.search).toBe('/es/confirmar-correo?x=1')
  })

  it('si al terminar de montar Next vuelve a escribir la dirección con el token, también se borra', async () => {
    abrir(`/es/confirmar-correo#token=${TOKEN}`)
    montar()
    // Lo que hace el enrutador de Next al montar: sincroniza la barra con la dirección con la que se cargó la página
    window.history.replaceState(null, '', `/es/confirmar-correo#token=${TOKEN}`)

    await waitFor(() => expect(window.location.hash).toBe(''))
  })

  it('al final deja la dirección limpia con state nulo: así el enrutador de Next la copia y no vuelve a poner el token', async () => {
    // Como la deja Next al cargar: con su propio state (con el que tomaría la llamada por suya y la ignoraría)
    window.history.replaceState({ __NA: true }, '', `/es/confirmar-correo#token=${TOKEN}`)
    const llamadas: [unknown, string | URL | null | undefined][] = []
    const original = window.history.replaceState.bind(window.history)
    const espia = vi.spyOn(window.history, 'replaceState').mockImplementation((estado, titulo, url) => {
      llamadas.push([estado, url])
      original(estado, titulo, url)
    })
    try {
      montar()
      await waitFor(() => expect(llamadas.length).toBeGreaterThanOrEqual(2))
    } finally {
      espia.mockRestore()
    }

    expect(llamadas.at(-1)).toEqual([null, '/es/confirmar-correo'])
  })

  it('aunque React ejecute el efecto dos veces (modo estricto), confirma una sola vez', async () => {
    abrir(`/es/confirmar-correo#token=${TOKEN}`)
    const { alConfirmar } = montar(undefined, { estricto: true })

    await screen.findByRole('heading', { level: 1, name: t.confirmar.confirmado.titulo })
    expect(alConfirmar).toHaveBeenCalledTimes(1)
  })

  it('en modo estricto, tras un fallo, reintentar usa el token aunque el efecto se ejecutara dos veces', async () => {
    abrir(`/es/confirmar-correo#token=${TOKEN}`)
    const { alConfirmar, usuario } = montar({ ok: false, motivo: 'fallo' }, { estricto: true })

    await screen.findByRole('heading', { level: 1, name: t.confirmar.error.titulo })
    alConfirmar.mockResolvedValueOnce({ ok: true, correo: 'ana@correo.com', dentro: false })
    await usuario.click(screen.getByRole('button', { name: t.confirmar.reintentar }))

    expect(await screen.findByRole('heading', { level: 1, name: t.confirmar.confirmado.titulo })).toBeInTheDocument()
    expect(alConfirmar).toHaveBeenLastCalledWith(TOKEN)
  })

  it('con la página ya abierta, un enlace nuevo en la misma pestaña (solo cambia lo de tras «#») también confirma', async () => {
    abrir('/es/confirmar-correo')
    const { alConfirmar } = montar()
    await screen.findByRole('heading', { level: 1, name: t.confirmar.sinEnlace.titulo })

    // El navegador no recarga la página: solo cambia el fragmento y avisa con «hashchange»
    window.location.hash = `#token=${TOKEN}`

    expect(await screen.findByRole('heading', { level: 1, name: t.confirmar.confirmado.titulo })).toBeInTheDocument()
    expect(alConfirmar).toHaveBeenCalledExactlyOnceWith(TOKEN)
    await waitFor(() => expect(window.location.hash).toBe(''))
  })

  it('el mismo token no se confirma dos veces aunque vuelva a aparecer tras «#»', async () => {
    abrir(`/es/confirmar-correo#token=${TOKEN}`)
    const { alConfirmar } = montar({ ok: false, motivo: 'invalido' })
    await screen.findByRole('heading', { level: 1, name: t.confirmar.invalido.titulo })

    window.location.hash = `#token=${TOKEN}`
    await waitFor(() => expect(window.location.hash).toBe(''))

    expect(alConfirmar).toHaveBeenCalledTimes(1)
  })

  it('mientras confirma, lo dice', async () => {
    abrir(`/es/confirmar-correo#token=${TOKEN}`)
    let terminar: (r: ResultadoConfirmacion) => void = () => undefined
    const alConfirmar = vi.fn(() => new Promise<ResultadoConfirmacion>((resolver) => (terminar = resolver)))
    render(<ConfirmarCorreoView textos={t} alConfirmar={alConfirmar} alReenviar={vi.fn()} hrefInicioSesion="/es/iniciar-sesion" hrefContinuar="/es/bienvenida" />)

    expect(screen.getByRole('heading', { level: 1, name: t.confirmar.confirmando })).toBeInTheDocument()
    await waitFor(() => expect(alConfirmar).toHaveBeenCalled())
    terminar({ ok: true, correo: 'ana@correo.com', dentro: false })
    expect(await screen.findByRole('heading', { level: 1, name: t.confirmar.confirmado.titulo })).toBeInTheDocument()
  })

  it('sin token no pregunta nada y ofrece pedir un enlace nuevo', async () => {
    abrir('/es/confirmar-correo')
    const { alConfirmar } = montar()

    expect(await screen.findByRole('heading', { level: 1, name: t.confirmar.sinEnlace.titulo })).toBeInTheDocument()
    expect(alConfirmar).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: t.confirmar.otroEnlace.boton })).toBeInTheDocument()
  })

  it('con un enlace que no vale, explica y deja pedir otro al correo escrito', async () => {
    abrir(`/es/confirmar-correo#token=${TOKEN}`)
    const { alReenviar, usuario } = montar({ ok: false, motivo: 'invalido' })

    expect(await screen.findByRole('heading', { level: 1, name: t.confirmar.invalido.titulo })).toBeInTheDocument()
    await usuario.type(screen.getByLabelText(t.campos.correo), 'ana@correo.com')
    await usuario.click(screen.getByRole('button', { name: t.confirmar.otroEnlace.boton }))

    expect(alReenviar).toHaveBeenCalledExactlyOnceWith('ana@correo.com')
    expect(await screen.findByText(t.confirmar.otroEnlace.enviado)).toBeInTheDocument()
  })

  it('al pedir otro enlace, el límite de intentos se avisa', async () => {
    abrir('/es/confirmar-correo')
    const alReenviar = vi.fn(async (): Promise<ResultadoReenvio> => ({ ok: false, motivo: 'limite' }))
    render(<ConfirmarCorreoView textos={t} alConfirmar={vi.fn()} alReenviar={alReenviar} hrefInicioSesion="/es/iniciar-sesion" hrefContinuar="/es/bienvenida" />)
    const usuario = userEvent.setup()

    await usuario.type(await screen.findByLabelText(t.campos.correo), 'ana@correo.com')
    await usuario.click(screen.getByRole('button', { name: t.confirmar.otroEnlace.boton }))

    expect(await screen.findByText(t.avisos.limite)).toBeInTheDocument()
  })

  it('con demasiados intentos de confirmar, lo avisa', async () => {
    abrir(`/es/confirmar-correo#token=${TOKEN}`)
    montar({ ok: false, motivo: 'limite' })

    expect(await screen.findByText(t.avisos.limite)).toBeInTheDocument()
  })

  it('si falla, deja reintentar con el mismo token aunque ya no esté en la barra', async () => {
    abrir(`/es/confirmar-correo#token=${TOKEN}`)
    const { alConfirmar, usuario } = montar({ ok: false, motivo: 'fallo' })

    await screen.findByRole('heading', { level: 1, name: t.confirmar.error.titulo })
    alConfirmar.mockResolvedValueOnce({ ok: true, correo: 'ana@correo.com', dentro: false })
    await usuario.click(screen.getByRole('button', { name: t.confirmar.reintentar }))

    expect(await screen.findByRole('heading', { level: 1, name: t.confirmar.confirmado.titulo })).toBeInTheDocument()
    expect(alConfirmar).toHaveBeenNthCalledWith(2, TOKEN)
  })

  it('si la acción misma falla (sin respuesta), se trata como un fallo', async () => {
    abrir(`/es/confirmar-correo#token=${TOKEN}`)
    const alConfirmar = vi.fn(async (): Promise<ResultadoConfirmacion> => {
      throw new Error('red')
    })
    render(<ConfirmarCorreoView textos={t} alConfirmar={alConfirmar} alReenviar={vi.fn()} hrefInicioSesion="/es/iniciar-sesion" hrefContinuar="/es/bienvenida" />)

    expect(await screen.findByRole('heading', { level: 1, name: t.confirmar.error.titulo })).toBeInTheDocument()
  })
})
