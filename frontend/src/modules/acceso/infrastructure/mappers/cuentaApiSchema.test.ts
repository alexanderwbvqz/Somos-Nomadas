import { describe, expect, it } from 'vitest'
import { leerSesionIniciada } from './cuentaApiSchema'

const valida = { token_acceso: 'a.b.c', expira_en: 900, token_renovacion: 'renovacion-1', correo: 'ana@correo.com' }

describe('leerSesionIniciada', () => {
  it('con la respuesta de la API devuelve solo el correo: los tokens no salen de aquí', () => {
    const sesion = leerSesionIniciada(valida)

    expect(sesion).toEqual({ correo: 'ana@correo.com' })
    // Los tokens no deben poder llegar al navegador por un descuido: el resultado no los lleva ni de pasada
    expect(JSON.stringify(sesion)).not.toContain('renovacion-1')
    expect(JSON.stringify(sesion)).not.toContain('a.b.c')
  })

  it('ignora los campos que la API añada', () => {
    expect(leerSesionIniciada({ ...valida, algo_nuevo: true })).toEqual({ correo: 'ana@correo.com' })
  })

  it.each([
    ['sin cuerpo', undefined],
    ['null', null],
    ['un texto', 'hola'],
    ['un array', [valida]],
    ['sin token_acceso', { ...valida, token_acceso: undefined }],
    ['con token_acceso vacío', { ...valida, token_acceso: '' }],
    ['con token_acceso que no es texto', { ...valida, token_acceso: 5 }],
    ['sin token_renovacion', { ...valida, token_renovacion: undefined }],
    ['con token_renovacion vacío', { ...valida, token_renovacion: '' }],
    ['sin expira_en', { ...valida, expira_en: undefined }],
    ['con expira_en en texto', { ...valida, expira_en: '900' }],
    ['con expira_en negativo', { ...valida, expira_en: -1 }],
    ['con expira_en decimal', { ...valida, expira_en: 1.5 }],
    ['sin correo', { ...valida, correo: undefined }],
    ['con correo vacío', { ...valida, correo: '' }],
    ['con correo que no es texto', { ...valida, correo: 7 }],
  ])('una respuesta %s no es válida', (_nombre, cuerpo) => {
    expect(leerSesionIniciada(cuerpo)).toBeUndefined()
  })
})
