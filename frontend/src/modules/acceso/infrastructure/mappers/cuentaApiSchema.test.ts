import { describe, expect, it } from 'vitest'
import { leerCorreoConfirmado, leerCredencialRenovada, leerCuentaActual, leerSesionIniciada } from './cuentaApiSchema'

const valida = { token_acceso: 'a.b.c', expira_en: 900, token_renovacion: 'renovacion-1', correo: 'ana@correo.com' }
const credencial = { acceso: 'a.b.c', renovacion: 'renovacion-1', expiraEnSegundos: 900 }

describe('leerSesionIniciada', () => {
  it('con la respuesta de la API devuelve el correo y la credencial, con los nombres del dominio', () => {
    expect(leerSesionIniciada(valida)).toEqual({ correo: 'ana@correo.com', credencial })
  })

  it('ignora los campos que la API añada', () => {
    expect(leerSesionIniciada({ ...valida, algo_nuevo: true })).toEqual({ correo: 'ana@correo.com', credencial })
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

describe('leerCredencialRenovada', () => {
  const renovada = { token_acceso: 'x.y.z', expira_en: 900, token_renovacion: 'renovacion-2' }

  it('devuelve la credencial nueva', () => {
    expect(leerCredencialRenovada(renovada)).toEqual({ acceso: 'x.y.z', renovacion: 'renovacion-2', expiraEnSegundos: 900 })
  })

  it('no exige el correo (la renovación no lo trae) y no deja pasar campos de más', () => {
    const resultado = leerCredencialRenovada({ ...renovada, correo: 'ana@correo.com', otro: 1 })
    expect(Object.keys(resultado ?? {}).sort()).toEqual(['acceso', 'expiraEnSegundos', 'renovacion'])
  })

  it.each([
    ['sin cuerpo', undefined],
    ['sin token_acceso', { ...renovada, token_acceso: undefined }],
    ['con token_acceso vacío', { ...renovada, token_acceso: '' }],
    ['sin token_renovacion', { ...renovada, token_renovacion: undefined }],
    ['con token_renovacion vacío', { ...renovada, token_renovacion: '' }],
    ['con expira_en en cero', { ...renovada, expira_en: 0 }],
    ['con expira_en en texto', { ...renovada, expira_en: '900' }],
  ])('una respuesta %s no es válida', (_nombre, cuerpo) => {
    expect(leerCredencialRenovada(cuerpo)).toBeUndefined()
  })
})

describe('leerCuentaActual', () => {
  const yo = { id: '0b0e7a52-3f64-4a5e-8f6e-0c3c9b2f1a11', correo: 'ana@correo.com', correo_confirmado: false }

  it('traduce los nombres de la API a los del dominio', () => {
    expect(leerCuentaActual(yo)).toEqual({ id: yo.id, correo: 'ana@correo.com', correoConfirmado: false })
  })

  it('solo devuelve esos tres datos, aunque la API mande más', () => {
    const resultado = leerCuentaActual({ ...yo, clave_hash: 'secreto', politica_aceptada_en: '2026-01-01' })
    expect(Object.keys(resultado ?? {}).sort()).toEqual(['correo', 'correoConfirmado', 'id'])
  })

  it.each([
    ['sin cuerpo', undefined],
    ['sin id', { ...yo, id: undefined }],
    ['con id vacío', { ...yo, id: '' }],
    ['sin correo', { ...yo, correo: undefined }],
    ['con correo vacío', { ...yo, correo: '' }],
    ['sin correo_confirmado', { ...yo, correo_confirmado: undefined }],
    ['con correo_confirmado en texto', { ...yo, correo_confirmado: 'true' }],
  ])('una respuesta %s no es válida', (_nombre, cuerpo) => {
    expect(leerCuentaActual(cuerpo)).toBeUndefined()
  })
})

describe('leerCorreoConfirmado', () => {
  it('devuelve el correo de la respuesta de la confirmación', () => {
    expect(leerCorreoConfirmado({ correo: 'ana@correo.com' })).toEqual({ correo: 'ana@correo.com' })
    expect(leerCorreoConfirmado({ correo: 'ana@correo.com', algo_nuevo: 1 })).toEqual({ correo: 'ana@correo.com' })
  })

  it('con la sesión abierta devuelve también la credencial, con los nombres del dominio', () => {
    const sesion = { token_acceso: 'a.b.c', expira_en: 900, token_renovacion: 'renovacion-1' }

    expect(leerCorreoConfirmado({ correo: 'ana@correo.com', sesion })).toEqual({ correo: 'ana@correo.com', credencial })
  })

  it.each([
    ['sin cuerpo', undefined],
    ['sin correo', {}],
    ['con correo vacío', { correo: '' }],
    ['con correo que no es texto', { correo: 5 }],
    ['con una sesión a medias', { correo: 'ana@correo.com', sesion: { token_acceso: 'a.b.c' } }],
    ['con una sesión que no es un objeto', { correo: 'ana@correo.com', sesion: 'a.b.c' }],
    ['con la sesión nula', { correo: 'ana@correo.com', sesion: null }],
  ])('una respuesta %s no es válida', (_nombre, cuerpo) => {
    expect(leerCorreoConfirmado(cuerpo)).toBeUndefined()
  })
})
