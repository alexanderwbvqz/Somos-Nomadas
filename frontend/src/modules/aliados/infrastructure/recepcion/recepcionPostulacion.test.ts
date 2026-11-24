import { beforeEach, describe, expect, it } from 'vitest'
import { datosPostulacionVacios } from '../../domain/postulacion'
import { MockPostulacionRepository } from '../mock/MockPostulacionRepository'
import { recibirPostulacion } from './recepcionPostulacion'

const veinte = Array.from({ length: 20 }, (_, i) => `palabra${i}`).join(' ')
const validos = {
  ...datosPostulacionVacios(),
  tipo: 'organizadores',
  nombre: 'Cowork',
  personaContacto: 'Ana',
  correo: 'ana@cowork.com',
  descripcionCorta: veinte,
  enlaceAgenda: 'https://cal.com/ana',
  aceptaPolitica: true,
}

describe('recibirPostulacion', () => {
  beforeEach(() => MockPostulacionRepository.vaciar())

  it('guarda una postulación válida', async () => {
    expect(await recibirPostulacion(new MockPostulacionRepository(), validos, 'cliente-valido')).toEqual({ ok: true })
    expect(MockPostulacionRepository.recibidas()).toHaveLength(1)
  })

  it('rechaza lo que no tiene la forma esperada', async () => {
    expect(await recibirPostulacion(new MockPostulacionRepository(), { cualquier: 'cosa' }, 'cliente-forma')).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
  })

  it('devuelve los errores de validación del servidor', async () => {
    const resultado = await recibirPostulacion(new MockPostulacionRepository(), { ...validos, nombre: '' }, 'cliente-errores')
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) expect(resultado.errores.nombre).toBe('obligatorio')
  })

  it('limita los envíos seguidos de un mismo cliente', async () => {
    const resultados = []
    for (let i = 0; i < 6; i++) resultados.push(await recibirPostulacion(new MockPostulacionRepository(), validos, 'cliente-limite'))
    expect(resultados.slice(0, 5).every((r) => r.ok)).toBe(true)
    expect(resultados[5]).toEqual({ ok: false, errores: {}, motivo: 'limite' })
    expect(await recibirPostulacion(new MockPostulacionRepository(), validos, 'otro-cliente')).toEqual({ ok: true })
  })
})
