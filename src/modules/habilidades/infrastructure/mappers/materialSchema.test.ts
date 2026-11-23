// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { leerMaterial } from './materialSchema'

function formulario(campos: Record<string, string | File> = {}): FormData {
  const datos = new FormData()
  const base: Record<string, string | File> = { web: '', github: '', otro: '', aceptaAnalisis: 'true', ...campos }
  for (const [clave, valor] of Object.entries(base)) datos.set(clave, valor)
  return datos
}

describe('leerMaterial', () => {
  it('lee los enlaces y el permiso', () => {
    expect(leerMaterial(formulario({ web: 'tuweb.com' }))).toEqual({
      web: 'tuweb.com',
      github: '',
      otro: '',
      aceptaAnalisis: true,
      archivo: undefined,
    })
  })

  it('lee el archivo cuando viene', () => {
    const archivo = new File(['%PDF-1.4'], 'cv.pdf', { type: 'application/pdf' })
    expect(leerMaterial(formulario({ pdf: archivo }))?.archivo?.name).toBe('cv.pdf')
  })

  it('un campo de archivo sin elegir (llega vacío y sin nombre) cuenta como sin archivo', () => {
    expect(leerMaterial(formulario({ pdf: new File([], '') }))?.archivo).toBeUndefined()
  })

  it('el permiso solo vale si dice true', () => {
    expect(leerMaterial(formulario({ aceptaAnalisis: 'false' }))?.aceptaAnalisis).toBe(false)
  })

  it('rechaza lo que no tiene la forma: no es un formulario, permiso raro, enlace enorme, archivo que es texto', () => {
    expect(leerMaterial({ web: 'x' })).toBeUndefined()
    expect(leerMaterial(undefined)).toBeUndefined()
    expect(leerMaterial(formulario({ aceptaAnalisis: 'quizá' }))).toBeUndefined()
    expect(leerMaterial(formulario({ web: 'a'.repeat(5000) }))).toBeUndefined()
    expect(leerMaterial(formulario({ pdf: 'no soy un archivo' }))).toBeUndefined()
  })
})
