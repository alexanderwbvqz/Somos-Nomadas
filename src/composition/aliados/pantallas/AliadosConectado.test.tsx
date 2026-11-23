import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { idiomas } from '@/shared/idiomas/idiomas'
import { AliadosConectado } from './AliadosConectado'

// Es un componente de servidor asíncrono: se resuelve y se dibuja su resultado
async function dibujar(idioma: (typeof idiomas)[number], tipo?: string) {
  return render(await AliadosConectado({ idioma, tipo }))
}

// El nombre de cada tarjeta es un h2 dentro de la lista (la página tiene además otro h2 con la invitación a postular)
function nombresDeTarjetas() {
  return screen.getAllByRole('heading', { level: 2 }).filter((h) => h.closest('li'))
}

describe('AliadosConectado', () => {
  it.each([
    ['es', 'Red de aliados'],
    ['en', 'Ally network'],
    ['pt', 'Rede de aliados'],
  ] as const)('en %s muestra el titular "%s"', async (idioma, titulo) => {
    await dibujar(idioma)
    expect(screen.getByRole('heading', { level: 1, name: titulo })).toBeInTheDocument()
  })

  it('lista los aliados del adaptador, con el tipo en singular y el enlace a su página en el idioma', async () => {
    await dibujar('es')
    expect(screen.getByRole('heading', { level: 2, name: 'Mentoría en producto' })).toBeInTheDocument()
    const enlaces = screen.getAllByRole('link', { name: 'Leer más' })
    expect(enlaces[0]).toHaveAttribute('href', '/es/aliados/mentoria-producto')
  })

  it('al final hay un llamado a ser aliado que lleva a la postulación en el idioma de la página', async () => {
    await dibujar('es')
    expect(screen.getByRole('heading', { level: 2, name: '¿Tu organización puede impulsar equipos?' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Quiero ser aliado' })).toHaveAttribute('href', '/es/aliados/postular')
    const { unmount } = await dibujar('en')
    expect(screen.getAllByRole('link', { name: 'I want to be an ally' })[0]).toHaveAttribute('href', '/en/aliados/postular')
    unmount()
  })

  it('los contadores de los filtros suman los 12 aliados de ejemplo', async () => {
    await dibujar('es')
    const filtros = screen.getByRole('group', { name: 'Filtrar por tipo' })
    expect(within(filtros).getByRole('button', { name: 'Todos · 12' })).toBeInTheDocument()
    expect(within(filtros).getByRole('button', { name: 'Mentores · 4' })).toBeInTheDocument()
    expect(within(filtros).getByRole('button', { name: 'Organizadores · 4' })).toBeInTheDocument()
    expect(within(filtros).getByRole('button', { name: 'Aliados estratégicos · 4' })).toBeInTheDocument()
  })

  it('?tipo=mentores abre la página filtrada; un tipo inválido deja "todos"', async () => {
    const { unmount } = await dibujar('es', 'mentores')
    expect(screen.getByRole('button', { name: 'Mentores · 4' })).toHaveAttribute('aria-pressed', 'true')
    expect(nombresDeTarjetas()).toHaveLength(4)
    unmount()

    await dibujar('es', 'inventado')
    expect(screen.getByRole('button', { name: 'Todos · 12' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('el listado muestra nueve y deja "Ver más" para los tres restantes', async () => {
    await dibujar('es')
    expect(nombresDeTarjetas()).toHaveLength(9)
    expect(screen.getByText('Mostrando 9 de 12')).toBeInTheDocument()
  })

  it.each(idiomas)('en %s no queda ninguna plantilla {…} sin rellenar', async (idioma) => {
    const { container } = await dibujar(idioma)
    expect(container.textContent).not.toMatch(/\{\w+\}/)
  })
})
