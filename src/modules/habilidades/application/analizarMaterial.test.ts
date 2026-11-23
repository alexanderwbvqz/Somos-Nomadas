import { describe, expect, it } from 'vitest'
import type { AnalisisRepository } from '../domain/AnalisisRepository'
import { datosMaterialVacios, type DatosMaterial } from '../domain/material'
import { MockAnalisisRepository } from '../infrastructure/mock/MockAnalisisRepository'
import { analizarMaterial } from './analizarMaterial'

const repositorio = () => new MockAnalisisRepository(0)
const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])

function conWebYGithub(): DatosMaterial {
  return { ...datosMaterialVacios(), web: 'https://tuweb.com', github: 'github.com/ana', aceptaAnalisis: true }
}

describe('analizarMaterial', () => {
  it('con enlaces válidos y permiso devuelve sugerencias', async () => {
    const resultado = await analizarMaterial(repositorio(), { datos: conWebYGithub() })
    expect(resultado.ok).toBe(true)
    if (resultado.ok) expect(resultado.sugerencias.length).toBeGreaterThan(0)
  })

  it('cada sugerencia dice su fuente, y una tarea no sale dos veces', async () => {
    const resultado = await analizarMaterial(repositorio(), {
      datos: { ...conWebYGithub(), archivo: { nombre: 'cv.pdf', tamano: 5, tipo: 'application/pdf' } },
      bytes,
    })
    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return
    const tareas = resultado.sugerencias.map((sugerencia) => sugerencia.tarea)
    expect(new Set(tareas).size).toBe(tareas.length)
    expect(resultado.sugerencias.some((sugerencia) => sugerencia.fuente === 'pdf')).toBe(true)
    expect(resultado.sugerencias.every((sugerencia) => [1, 2, 3, 4, 5].includes(sugerencia.nivel))).toBe(true)
  })

  it('sin el permiso no analiza nada: ni siquiera llama al repositorio', async () => {
    let llamadas = 0
    const espia: AnalisisRepository = { analizar: async () => { llamadas++; return [] } }
    const resultado = await analizarMaterial(espia, { datos: { ...conWebYGithub(), aceptaAnalisis: false } })
    expect(resultado).toEqual({ ok: false, errores: { aceptaAnalisis: 'faltaPermiso' } })
    expect(llamadas).toBe(0)
  })

  it('devuelve los errores de los datos y no analiza si no hay material', async () => {
    const resultado = await analizarMaterial(repositorio(), { datos: datosMaterialVacios() })
    expect(resultado).toEqual({ ok: false, errores: { material: 'sinMaterial', aceptaAnalisis: 'faltaPermiso' } })
  })

  it('si el repositorio falla, avisa con "fallo" y no con errores de datos', async () => {
    const roto: AnalisisRepository = { analizar: async () => { throw new Error('x') } }
    expect(await analizarMaterial(roto, { datos: conWebYGithub() })).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
  })

  it('al repositorio le llegan los enlaces ya limpios y sin repetir', async () => {
    let recibido: unknown
    const espia: AnalisisRepository = { analizar: async (material) => { recibido = material; return [] } }
    await analizarMaterial(espia, { datos: { ...datosMaterialVacios(), web: 'tuweb.com', otro: 'https://tuweb.com', aceptaAnalisis: true } })
    expect(recibido).toEqual({ pdf: undefined, enlaces: [{ campo: 'web', url: 'https://tuweb.com' }] })
  })
})
