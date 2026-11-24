import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { es } from '../language/es'
import { CierreView } from './CierreView'

const t = es.cierre

// El fondo de puntos dibuja en un lienzo, que jsdom no tiene: aquí solo importa lo demás
vi.mock('@/shared/ui/FondoPuntos', () => ({ FondoPuntos: () => <div data-testid="fondo" /> }))

type Resultado = { ok: true } | { ok: false }

function montar(alPreparar: () => Promise<Resultado>, esperaMinima = 0, iniciales = 'AT') {
  render(<CierreView textos={es} iniciales={iniciales} logoSrc="/logo.svg" isotipoSrc="/isotipo.svg" hrefInicio="/es" hrefPerfil="/es/perfil" alPreparar={alPreparar} esperaMinima={esperaMinima} />)
}

describe('CierreView', () => {
  it('mientras prepara muestra la espera, sin botones ni enlaces', () => {
    montar(() => new Promise<Resultado>(() => {}), 0)
    expect(screen.getByRole('heading', { level: 1, name: t.esperaTitulo })).toBeInTheDocument()
    expect(screen.getByText(t.esperaTexto)).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('al terminar muestra que está listo, con «Revisar mi perfil» como enlace y «Ir a descubrir» apagado y con «Pronto», y el foco en el título', async () => {
    montar(async () => ({ ok: true }))
    const titulo = await screen.findByRole('heading', { level: 1, name: t.listoTitulo })
    expect(screen.getByText(t.listoTexto)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: new RegExp(t.descubrir) })).toBeDisabled()
    expect(screen.getByRole('link', { name: t.revisarPerfil })).toHaveAttribute('href', '/es/perfil')
    expect(screen.queryByRole('button', { name: new RegExp(t.revisarPerfil) })).not.toBeInTheDocument()
    // La insignia «Pronto» queda solo en lo que todavía no existe
    expect(screen.getAllByText(t.pronto)).toHaveLength(1)
    expect(screen.getByRole('button', { name: new RegExp(t.descubrir) })).toHaveTextContent(t.pronto)
    await waitFor(() => expect(titulo).toHaveFocus())
    expect(screen.getByRole('link', { name: t.inicio })).toHaveAttribute('href', '/es')
  })

  it('no muestra el resultado antes de la espera mínima, aunque el cálculo ya esté', async () => {
    vi.useFakeTimers()
    try {
      montar(async () => ({ ok: true }), 2500)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000)
      })
      expect(screen.getByRole('heading', { level: 1, name: t.esperaTitulo })).toBeInTheDocument()
      await act(async () => {
        await vi.advanceTimersByTimeAsync(600)
      })
      expect(screen.getByRole('heading', { level: 1, name: t.listoTitulo })).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('muestra las iniciales como avatar; sin nombre, el isotipo en su lugar', () => {
    const { unmount } = render(<CierreView textos={es} iniciales="AT" logoSrc="/logo.svg" isotipoSrc="/isotipo.svg" hrefInicio="/es" hrefPerfil="/es/perfil" alPreparar={() => new Promise<Resultado>(() => {})} esperaMinima={0} />)
    const avatar = screen.getByRole('img', { name: t.avatar })
    expect(avatar).toHaveTextContent('AT')
    expect(avatar.querySelector('img')).toBeNull()
    unmount()
    montar(() => new Promise<Resultado>(() => {}), 0, '')
    const sinNombre = screen.getByRole('img', { name: t.avatar })
    expect(sinNombre).toHaveTextContent('')
    expect(sinNombre.querySelector('img')).toHaveAttribute('src', '/isotipo.svg')
  })

  it('si falla, lo dice y deja reintentar; al reintentar vuelve a la espera y luego al resultado', async () => {
    const alPreparar = vi.fn<() => Promise<Resultado>>().mockResolvedValueOnce({ ok: false }).mockResolvedValue({ ok: true })
    montar(alPreparar)
    expect(await screen.findByRole('heading', { level: 1, name: t.fallo.titulo })).toBeInTheDocument()
    expect(screen.getByText(t.fallo.texto)).toBeInTheDocument()
    expect(screen.queryByText(t.pronto)).not.toBeInTheDocument()

    await userEvent.setup().click(screen.getByRole('button', { name: t.reintentar }))
    expect(await screen.findByRole('heading', { level: 1, name: t.listoTitulo })).toBeInTheDocument()
    expect(alPreparar).toHaveBeenCalledTimes(2)
  })

  it('si la acción lanza un error, se trata como un fallo', async () => {
    montar(() => Promise.reject(new Error('sin red')))
    expect(await screen.findByRole('heading', { level: 1, name: t.fallo.titulo })).toBeInTheDocument()
  })
})
