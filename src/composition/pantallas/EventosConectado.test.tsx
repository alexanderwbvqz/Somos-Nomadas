import { render, screen, within } from '@testing-library/react'
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
    const proximo = screen.getByRole('region', { name: 'El próximo evento' })
    const confirmar = within(proximo).getByRole('link', { name: 'Confirmar asistencia' })
    expect(confirmar.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/51973356545\?text=/)
    expect(decodeURIComponent(confirmar.getAttribute('href') ?? '')).toContain('Match and Building')
  })

  it('el listado de más eventos trae los siguientes (29 de los 30) y muestra los primeros nueve', async () => {
    await dibujar('es')
    expect(screen.getByRole('heading', { level: 2, name: 'Más eventos' })).toBeInTheDocument()
    expect(screen.getByText('29 eventos')).toBeInTheDocument()
    const lista = screen.getByRole('region', { name: 'Más eventos' })
    expect(lista.querySelectorAll('h3')).toHaveLength(9)
    expect(screen.getByText('Mostrando 9 de 29')).toBeInTheDocument()
  })

  it('el próximo evento no se repite en el listado', async () => {
    await dibujar('es')
    const lista = screen.getByRole('region', { name: 'Más eventos' })
    expect(Array.from(lista.querySelectorAll('h3')).map((h) => h.textContent)).not.toContain('Match and Building')
  })

  it('si todos los eventos ya pasaron, muestra el aviso en vez del evento', async () => {
    await dibujar('es', new Date('2100-01-01T00:00:00.000Z'))
    expect(screen.getByRole('heading', { level: 3, name: 'Por ahora no hay eventos programados' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Confirmar asistencia' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Avísame' }).getAttribute('href')).toMatch(/^https:\/\/wa\.me\/51973356545/)
    expect(screen.queryByRole('heading', { level: 2, name: 'Más eventos' })).not.toBeInTheDocument()
  })

  it.each(idiomas)('en %s no queda ninguna plantilla {…} sin rellenar', async (idioma) => {
    const { container } = await dibujar(idioma)
    expect(container.textContent).not.toMatch(/\{\w+\}/)
  })
})
