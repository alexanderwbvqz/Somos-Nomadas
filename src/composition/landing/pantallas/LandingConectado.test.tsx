import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MockHistoriasRepository } from '@/modules/landing/infrastructure/mock/MockHistoriasRepository'
import { idiomas } from '@/shared/idiomas/idiomas'
import { LandingConectado } from './LandingConectado'

// Es un componente de servidor asíncrono: se resuelve y se dibuja su resultado
async function dibujar(idioma: (typeof idiomas)[number]) {
  return render(await LandingConectado({ idioma }))
}

afterEach(() => vi.restoreAllMocks())

describe('LandingConectado', () => {
  it('arma la landing en español con las cifras formateadas y la fecha del dato de registrados', async () => {
    await dibujar('es')
    expect(screen.getByRole('heading', { level: 1, name: /personas correctas/ })).toBeInTheDocument()
    // La cifra lleva espacio duro entre el número y el %; \s lo admite
    expect(screen.getByText(/^75\s%$/)).toBeInTheDocument()
    expect(screen.getByText('7×')).toBeInTheDocument()
    expect(screen.getByText('75+')).toBeInTheDocument()
    expect(screen.getByText('Nómadas, noviembre de 2026')).toBeInTheDocument()
    expect(screen.getByText(/frente al 35 % de las nuevas/)).toBeInTheDocument()
  })

  it.each(idiomas)('en %s no queda ninguna plantilla {…} sin rellenar', async (idioma) => {
    const { container } = await dibujar(idioma)
    expect(container.textContent).not.toMatch(/\{\w+\}/)
  })

  it('incluye la sección del match con el total de 10 conexiones', async () => {
    await dibujar('es')
    expect(screen.getByRole('heading', { level: 2, name: /Pensado para formar equipos/ })).toBeInTheDocument()
    expect(screen.getByText('Hasta 10 conexiones')).toBeInTheDocument()
    expect(screen.getByText('1 + 3 + 3 + 3')).toBeInTheDocument()
  })

  it('incluye los cuatro pilares, cada uno con Postular y Ver perfiles hacia su área', async () => {
    await dibujar('es')
    expect(screen.getByRole('heading', { level: 2, name: /Todo equipo necesita las cuatro/ })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Postular' })).toHaveLength(4)
    const perfiles = screen.getAllByRole('link', { name: 'Ver perfiles' })
    expect(perfiles.map((enlace) => enlace.getAttribute('href'))).toEqual([
      '/es/directorio?area=tecnologia',
      '/es/directorio?area=marketing',
      '/es/directorio?area=operaciones',
      '/es/directorio?area=finanzas',
    ])
  })

  it('incluye la sección de aliados con los tres tipos y sin números mientras no haya aliados', async () => {
    await dibujar('es')
    expect(screen.getByRole('heading', { level: 2, name: /Ningún equipo crece solo/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Mentores' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Organizadores' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Aliados estratégicos' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver mentores' })).toHaveAttribute('href', '/es/aliados?tipo=mentores')
    expect(screen.getByRole('link', { name: 'Quiero ser aliado' })).toHaveAttribute('href', '/es/aliados/postular')
    expect(screen.queryByText(/\d+ activos?/)).not.toBeInTheDocument()
  })

  it('en inglés el dato comparado y los títulos salen en inglés', async () => {
    await dibujar('en')
    expect(screen.getByRole('heading', { level: 2, name: 'Why the team matters' })).toBeInTheDocument()
    expect(screen.getByText(/versus 35% of new ones/)).toBeInTheDocument()
  })

  it('incluye la sección de historias entre los pilares y los aliados, con las cuatro historias completas', async () => {
    await dibujar('es')
    const pilares = screen.getByRole('heading', { level: 2, name: /Todo equipo necesita las cuatro/ })
    const historias = screen.getByRole('heading', { level: 2, name: 'Los grandes proyectos empezaron con un encuentro.' })
    const aliados = screen.getByRole('heading', { level: 2, name: /Ningún equipo crece solo/ })
    expect(pilares.compareDocumentPosition(historias) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(historias.compareDocumentPosition(aliados) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByText('Tu historia también puede empezar así.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Leer la historia' })).toBeInTheDocument()
    const pestanas = within(screen.getByRole('tablist', { name: 'Elige una historia' })).getAllByRole('tab')
    expect(pestanas.map((pestana) => pestana.textContent)).toEqual([
      expect.stringContaining('Apple'),
      expect.stringContaining('Airbnb'),
      expect.stringContaining('Nike'),
      expect.stringContaining('Mercado Libre'),
    ])
  })

  it('la historia que falta por escribir no sale', async () => {
    await dibujar('es')
    expect(screen.queryByRole('tab', { name: /Rappi/ })).not.toBeInTheDocument()
  })

  it('el botón de las historias lleva al registro, igual que el del hero', async () => {
    await dibujar('es')
    const botones = screen.getAllByRole('link', { name: 'Encuentra a tu equipo' })
    expect(botones).toHaveLength(2)
    expect(botones.map((boton) => boton.getAttribute('href'))).toEqual(['/es/registro', '/es/registro'])
  })

  it.each([
    ['en', 'Great projects began with an encounter.', 'Engineering + Sales', 'Find your team'],
    ['pt', 'Os grandes projetos começaram com um encontro.', 'Engenharia + Vendas', 'Encontre a sua equipe'],
  ] as const)('en %s la sección y las historias salen en ese idioma', async (idioma, titulo, combinacion, boton) => {
    await dibujar(idioma)
    expect(screen.getByRole('heading', { level: 2, name: titulo })).toBeInTheDocument()
    expect(screen.getAllByRole('tab').some((pestana) => pestana.textContent?.includes(combinacion))).toBe(true)
    expect(screen.getAllByRole('link', { name: boton })).toHaveLength(2)
  })

  it('si no se pueden leer las historias, la landing sigue completa sin esa sección', async () => {
    vi.spyOn(MockHistoriasRepository.prototype, 'obtener').mockRejectedValueOnce(new Error('sin red'))
    await dibujar('es')
    expect(screen.queryByRole('heading', { level: 2, name: /Los grandes proyectos empezaron con/ })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: /personas correctas/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /Ningún equipo crece solo/ })).toBeInTheDocument()
  })
})
