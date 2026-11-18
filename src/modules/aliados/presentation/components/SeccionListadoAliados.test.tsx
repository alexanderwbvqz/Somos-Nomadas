import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { TipoAliado } from '../../domain/Aliado'
import { SeccionListadoAliados, type AliadoVista } from './SeccionListadoAliados'

const textos = {
  etiquetaFiltro: 'Filtrar por tipo',
  todos: 'Todos',
  tipos: {
    mentores: { plural: 'Mentores', singular: 'Mentor' },
    organizadores: { plural: 'Organizadores', singular: 'Organizador' },
    estrategicos: { plural: 'Aliados estratégicos', singular: 'Aliado estratégico' },
  },
  leerMas: 'Leer más',
  verMas: 'Ver más aliados',
  mostrando: 'Mostrando {mostrados} de {total}',
  vacio: 'Todavía no hay aliados de este tipo.',
}

function aliado(n: number, tipo: TipoAliado): AliadoVista {
  return {
    id: `a${n}`,
    nombre: `Aliado ${n}`,
    tipo,
    descripcion: `Descripción ${n}`,
    etiquetaTipo: textos.tipos[tipo].singular,
    href: `/es/aliados/a${n}`,
  }
}

// 3 mentores, 2 organizadores, 1 estratégico
const aliados = [aliado(1, 'mentores'), aliado(2, 'organizadores'), aliado(3, 'estrategicos'), aliado(4, 'mentores'), aliado(5, 'organizadores'), aliado(6, 'mentores')]

describe('SeccionListadoAliados', () => {
  it('muestra los filtros con el número de aliados de cada tipo, con "Todos" activo', () => {
    render(<SeccionListadoAliados textos={textos} aliados={aliados} />)
    const filtros = screen.getByRole('group', { name: 'Filtrar por tipo' })
    expect(within(filtros).getByRole('button', { name: 'Todos · 6' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(filtros).getByRole('button', { name: 'Mentores · 3' })).toHaveAttribute('aria-pressed', 'false')
    expect(within(filtros).getByRole('button', { name: 'Organizadores · 2' })).toBeInTheDocument()
    expect(within(filtros).getByRole('button', { name: 'Aliados estratégicos · 1' })).toBeInTheDocument()
  })

  it('cada aliado muestra nombre, tipo, descripción y un Leer más hacia su página', () => {
    render(<SeccionListadoAliados textos={textos} aliados={aliados} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Aliado 1' })).toBeInTheDocument()
    expect(screen.getAllByText('Mentor').length).toBeGreaterThan(0)
    expect(screen.getByText('Descripción 1')).toBeInTheDocument()
    const enlaces = screen.getAllByRole('link', { name: 'Leer más' })
    expect(enlaces).toHaveLength(6)
    expect(enlaces[0]).toHaveAttribute('href', '/es/aliados/a1')
  })

  it('al elegir un tipo muestra solo esos aliados y lo marca como activo', async () => {
    render(<SeccionListadoAliados textos={textos} aliados={aliados} />)
    await userEvent.click(screen.getByRole('button', { name: 'Mentores · 3' }))
    expect(screen.getByRole('button', { name: 'Mentores · 3' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Todos · 6' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Aliado 1', 'Aliado 4', 'Aliado 6'])
  })

  it('al elegir un tipo se actualiza la URL con ?tipo= y "Todos" la deja sin parámetro', async () => {
    render(<SeccionListadoAliados textos={textos} aliados={aliados} />)
    await userEvent.click(screen.getByRole('button', { name: 'Organizadores · 2' }))
    expect(window.location.search).toBe('?tipo=organizadores')
    await userEvent.click(screen.getByRole('button', { name: 'Todos · 6' }))
    expect(window.location.search).toBe('')
  })

  it('con filtroInicial abre ya filtrado', () => {
    render(<SeccionListadoAliados textos={textos} aliados={aliados} filtroInicial="estrategicos" />)
    expect(screen.getByRole('button', { name: 'Aliados estratégicos · 1' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1)
  })

  it('con un tipo sin aliados muestra el aviso en lugar del listado', () => {
    render(<SeccionListadoAliados textos={textos} aliados={[aliado(1, 'mentores')]} filtroInicial="organizadores" />)
    expect(screen.getByText('Todavía no hay aliados de este tipo.')).toBeInTheDocument()
    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0)
  })

  it('muestra nueve y Ver más añade el resto; el contador se actualiza', async () => {
    const muchos = Array.from({ length: 12 }, (_, i) => aliado(i + 1, 'mentores'))
    render(<SeccionListadoAliados textos={textos} aliados={muchos} />)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(9)
    expect(screen.getByText('Mostrando 9 de 12')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Ver más aliados' }))
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(12)
    expect(screen.queryByRole('button', { name: 'Ver más aliados' })).not.toBeInTheDocument()
    expect(screen.getByText('Mostrando 12 de 12')).toHaveFocus()
  })

  it('al cambiar de filtro vuelve a mostrar solo los primeros nueve', async () => {
    const muchos = [
      ...Array.from({ length: 12 }, (_, i) => aliado(i + 1, 'mentores')),
      ...Array.from({ length: 11 }, (_, i) => aliado(i + 13, 'organizadores')),
    ]
    render(<SeccionListadoAliados textos={textos} aliados={muchos} />)
    await userEvent.click(screen.getByRole('button', { name: 'Ver más aliados' }))
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(18)
    await userEvent.click(screen.getByRole('button', { name: 'Organizadores · 11' }))
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(9)
    expect(screen.getByText('Mostrando 9 de 11')).toBeInTheDocument()
  })
})
