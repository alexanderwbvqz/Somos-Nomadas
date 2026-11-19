import { beforeEach, describe, expect, it } from 'vitest'
import { datosPostulacionVacios, type DatosPostulacion } from '../domain/postulacion'
import type { PostulacionRepository } from '../domain/PostulacionRepository'
import { MockPostulacionRepository } from '../infrastructure/mock/MockPostulacionRepository'
import { enviarPostulacion } from './enviarPostulacion'

const veinte = Array.from({ length: 20 }, (_, i) => `palabra${i}`).join(' ')

function completos(): DatosPostulacion {
  return {
    ...datosPostulacionVacios(),
    tipo: 'mentores',
    nombre: 'Ana',
    personaContacto: 'Ana',
    correo: 'ana@correo.com',
    descripcionCorta: veinte,
    enlaceAgenda: 'https://cal.com/ana',
    aceptaPolitica: true,
  }
}

describe('enviarPostulacion', () => {
  beforeEach(() => MockPostulacionRepository.vaciar())

  it('guarda una postulación válida', async () => {
    const resultado = await enviarPostulacion(new MockPostulacionRepository(), completos())
    expect(resultado).toEqual({ ok: true })
    expect(MockPostulacionRepository.recibidas()).toHaveLength(1)
  })

  it('devuelve errores y no guarda si los datos no son válidos', async () => {
    const resultado = await enviarPostulacion(new MockPostulacionRepository(), datosPostulacionVacios())
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) expect(resultado.errores.nombre).toBe('obligatorio')
    expect(MockPostulacionRepository.recibidas()).toHaveLength(0)
  })

  it('a un robot le responde ok sin guardar', async () => {
    const resultado = await enviarPostulacion(new MockPostulacionRepository(), { ...completos(), sitioSecundario: 'spam' })
    expect(resultado).toEqual({ ok: true })
    expect(MockPostulacionRepository.recibidas()).toHaveLength(0)
  })

  it('si el repositorio falla, responde motivo fallo', async () => {
    const roto: PostulacionRepository = { enviar: async () => { throw new Error('x') } }
    expect(await enviarPostulacion(roto, completos())).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
  })
})
