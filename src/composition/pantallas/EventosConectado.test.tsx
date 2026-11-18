import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { idiomas } from '@/shared/idiomas/idiomas'
import { EventosConectado } from './EventosConectado'

// Es un componente de servidor asíncrono: se resuelve y se dibuja su resultado
async function dibujar(idioma: (typeof idiomas)[number], ahora?: Date) {
  return render(await EventosConectado({ idioma, ahora }))
}

describe('EventosConectado', () => {
  it.each([
    ['es', 'Próximos eventos'],
    ['en', 'Upcoming events'],
    ['pt', 'Próximos eventos'],
  ] as const)('en %s muestra el titular "%s"', async (idioma, titulo) => {
    await dibujar(idioma)
    expect(screen.getByRole('heading', { level: 1, name: titulo })).toBeInTheDocument()
  })

  it('muestra el próximo evento del adaptador y su enlace de confirmación lleva a WhatsApp con el nombre', async () => {
    await dibujar('es')
    expect(screen.getByRole('heading', { level: 3, name: 'Match and Building' })).toBeInTheDocument()
    const confirmar = screen.getByRole('link', { name: 'Confirmar asistencia' })
    expect(confirmar.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/51973356545\?text=/)
    expect(decodeURIComponent(confirmar.getAttribute('href') ?? '')).toContain('Match and Building')
  })

  it('si todos los eventos ya pasaron, muestra el aviso en vez del evento', async () => {
    await dibujar('es', new Date('2100-01-01T00:00:00.000Z'))
    expect(screen.getByRole('heading', { level: 3, name: 'Por ahora no hay eventos programados' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Confirmar asistencia' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Avísame' }).getAttribute('href')).toMatch(/^https:\/\/wa\.me\/51973356545/)
  })

  it.each(idiomas)('en %s no queda ninguna plantilla {…} sin rellenar', async (idioma) => {
    const { container } = await dibujar(idioma)
    expect(container.textContent).not.toMatch(/\{\w+\}/)
  })
})
