// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { AnalisisRepository } from '../../domain/AnalisisRepository'
import { LIMITES_MATERIAL } from '../../domain/material'
import { MockAnalisisRepository } from '../mock/MockAnalisisRepository'
import { recibirMaterial } from './recepcionMaterial'

const repositorio = () => new MockAnalisisRepository(0)

function formulario(campos: Record<string, string | File> = {}): FormData {
  const datos = new FormData()
  const base: Record<string, string | File> = { web: '', github: '', otro: '', aceptaAnalisis: 'true', ...campos }
  for (const [clave, valor] of Object.entries(base)) datos.set(clave, valor)
  return datos
}

const pdfDeVerdad = () => new File(['%PDF-1.7 contenido'], 'cv.pdf', { type: 'application/pdf' })

describe('recibirMaterial', () => {
  it('analiza un PDF de verdad', async () => {
    const resultado = await recibirMaterial(repositorio(), formulario({ pdf: pdfDeVerdad() }), 'cliente-pdf')
    expect(resultado.ok).toBe(true)
    if (resultado.ok) expect(resultado.sugerencias.some((s) => s.fuente === 'pdf')).toBe(true)
  })

  it('analiza solo enlaces, sin archivo', async () => {
    expect((await recibirMaterial(repositorio(), formulario({ web: 'tuweb.com' }), 'cliente-enlaces')).ok).toBe(true)
  })

  it('un archivo que se llama .pdf y dice ser PDF, pero por dentro no lo es, se rechaza', async () => {
    const falso = new File(['MZ esto es un ejecutable'], 'cv.pdf', { type: 'application/pdf' })
    expect(await recibirMaterial(repositorio(), formulario({ pdf: falso }), 'cliente-falso')).toEqual({
      ok: false,
      errores: { archivo: 'archivoNoPdf' },
    })
  })

  it('un PDF que pasa del tamaño se rechaza sin llegar a analizarse', async () => {
    let llamadas = 0
    const espia: AnalisisRepository = { analizar: async () => { llamadas++; return [] } }
    const grande = new File(['%PDF-' + 'a'.repeat(LIMITES_MATERIAL.pdfBytes)], 'cv.pdf', { type: 'application/pdf' })
    expect(await recibirMaterial(espia, formulario({ pdf: grande }), 'cliente-grande')).toEqual({
      ok: false,
      errores: { archivo: 'archivoGrande' },
    })
    expect(llamadas).toBe(0)
  })

  it('sin el permiso no se analiza aunque el PDF sea bueno', async () => {
    let llamadas = 0
    const espia: AnalisisRepository = { analizar: async () => { llamadas++; return [] } }
    const resultado = await recibirMaterial(espia, formulario({ pdf: pdfDeVerdad(), aceptaAnalisis: 'false' }), 'cliente-sin-permiso')
    expect(resultado).toEqual({ ok: false, errores: { aceptaAnalisis: 'faltaPermiso' } })
    expect(llamadas).toBe(0)
  })

  it('un enlace a una dirección interna se rechaza', async () => {
    expect(await recibirMaterial(repositorio(), formulario({ web: 'http://127.0.0.1:8080' }), 'cliente-interno')).toEqual({
      ok: false,
      errores: { web: 'enlaceInvalido' },
    })
  })

  it('lo que no tiene la forma de un formulario responde "fallo"', async () => {
    expect(await recibirMaterial(repositorio(), { web: 'x' }, 'cliente-forma')).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
  })

  it('un mismo cliente no puede pasar del límite de intentos, y otro cliente no se ve afectado', async () => {
    for (let i = 0; i < 5; i++) await recibirMaterial(repositorio(), formulario({ web: 'tuweb.com' }), 'cliente-insistente')
    expect(await recibirMaterial(repositorio(), formulario({ web: 'tuweb.com' }), 'cliente-insistente')).toEqual({ ok: false, errores: {}, motivo: 'limite' })
    expect((await recibirMaterial(repositorio(), formulario({ web: 'tuweb.com' }), 'otro-cliente')).ok).toBe(true)
  })
})
