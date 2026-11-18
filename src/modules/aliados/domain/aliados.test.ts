import { describe, expect, it } from 'vitest'
import type { Aliado } from './Aliado'
import { contarPorTipo, esTipoAliado, filtrarAliados, filtroDesde } from './aliados'

function crear(id: string, tipo: Aliado['tipo']): Aliado {
  return { id, nombre: id.toUpperCase(), tipo, descripcion: '', descripcionLarga: [], datosClave: [], areas: [], apoyos: [], redes: [] }
}

const aliados: Aliado[] = [crear('a', 'mentores'), crear('b', 'organizadores'), crear('c', 'mentores'), crear('d', 'estrategicos')]

describe('esTipoAliado / filtroDesde', () => {
  it('reconoce los tres tipos y rechaza lo demás', () => {
    expect(esTipoAliado('mentores')).toBe(true)
    expect(esTipoAliado('organizadores')).toBe(true)
    expect(esTipoAliado('estrategicos')).toBe(true)
    expect(esTipoAliado('otro')).toBe(false)
    expect(esTipoAliado(null)).toBe(false)
    expect(esTipoAliado(undefined)).toBe(false)
  })

  it('un valor de la URL válido es el filtro; uno inválido o ausente es "todos"', () => {
    expect(filtroDesde('mentores')).toBe('mentores')
    expect(filtroDesde('cualquiera')).toBe('todos')
    expect(filtroDesde(null)).toBe('todos')
  })
})

describe('filtrarAliados', () => {
  it('"todos" devuelve la lista completa y un tipo devuelve solo ese tipo, en orden', () => {
    expect(filtrarAliados(aliados, 'todos')).toHaveLength(4)
    expect(filtrarAliados(aliados, 'mentores').map((a) => a.id)).toEqual(['a', 'c'])
    expect(filtrarAliados(aliados, 'estrategicos').map((a) => a.id)).toEqual(['d'])
  })

  it('un tipo sin aliados devuelve una lista vacía', () => {
    expect(filtrarAliados([aliados[0]!], 'organizadores')).toEqual([])
  })
})

describe('contarPorTipo', () => {
  it('cuenta cada tipo y pone cero a los que no tienen aliados', () => {
    expect(contarPorTipo(aliados)).toEqual({ mentores: 2, organizadores: 1, estrategicos: 1 })
    expect(contarPorTipo([])).toEqual({ mentores: 0, organizadores: 0, estrategicos: 0 })
  })
})
