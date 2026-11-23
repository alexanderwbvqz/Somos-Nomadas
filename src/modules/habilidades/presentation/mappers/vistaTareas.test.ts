import { describe, expect, it } from 'vitest'
import { grupos, habilidades } from '../../domain/catalogo'
import { en } from '../../language/en'
import { es } from '../../language/es'
import { gruposAbiertosAlEmpezar, vistaTareas } from './vistaTareas'

describe('vistaTareas', () => {
  it('muestra los diez grupos con sus 40 tareas, en el orden del catálogo y con los textos del idioma', () => {
    const vista = vistaTareas(es.tareas, {}, [])
    expect(vista.map((grupo) => grupo.grupo)).toEqual([...grupos])
    expect(vista.flatMap((grupo) => grupo.tareas.map((tarea) => tarea.habilidad))).toEqual([...habilidades])
    expect(vista[0]?.titulo).toBe('Definir y organizar')
    expect(vista[1]?.tareas[0]).toEqual({ habilidad: 'desarrolloWeb', texto: 'Programar una página web', frecuencia: undefined })
  })

  it('cuenta las marcadas de cada grupo y dice cuál es la frecuencia de cada una', () => {
    const vista = vistaTareas(es.tareas, { desarrolloWeb: 'esMiTrabajo', backendApis: 'unaVez', ventas: 'variasVeces' }, [])
    const construir = vista.find((grupo) => grupo.grupo === 'construir')
    expect(construir?.marcadas).toBe(2)
    expect(construir?.total).toBe(4)
    expect(construir?.tareas.find((tarea) => tarea.habilidad === 'desarrolloWeb')?.frecuencia).toBe('esMiTrabajo')
    expect(vista.find((grupo) => grupo.grupo === 'vender')?.marcadas).toBe(1)
    expect(vista.find((grupo) => grupo.grupo === 'dinero')?.marcadas).toBe(0)
  })

  it('marca como abiertos solo los grupos que se le dicen', () => {
    const vista = vistaTareas(es.tareas, {}, ['datos'])
    expect(vista.filter((grupo) => grupo.abierto).map((grupo) => grupo.grupo)).toEqual(['datos'])
  })

  it('cambia con el idioma', () => {
    expect(vistaTareas(en.tareas, {}, [])[0]?.titulo).toBe('Define and organize')
  })

  it('los nombres de los grupos no son los nombres de las áreas', () => {
    const nombres = vistaTareas(es.tareas, {}, []).map((grupo) => grupo.titulo.toLowerCase())
    for (const area of ['tecnología', 'ventas y marketing', 'finanzas', 'operaciones']) expect(nombres).not.toContain(area)
  })
})

describe('gruposAbiertosAlEmpezar', () => {
  it('sin nada marcado, solo el primero', () => {
    expect(gruposAbiertosAlEmpezar({})).toEqual(['definir'])
  })

  it('con tareas marcadas, el primero y los grupos que las tienen', () => {
    expect(gruposAbiertosAlEmpezar({ desarrolloWeb: 'unaVez', finanzasContabilidad: 'unaVez' })).toEqual(['definir', 'construir', 'dinero'])
  })

  it('si el primero ya tiene marcadas, no se repite', () => {
    expect(gruposAbiertosAlEmpezar({ estrategiaProducto: 'unaVez' })).toEqual(['definir'])
  })
})
