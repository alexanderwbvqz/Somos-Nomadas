import { describe, expect, it } from 'vitest'
import type { Historia } from '../domain/Historia'
import type { HistoriasRepository } from '../domain/HistoriasRepository'
import { obtenerHistorias } from './obtenerHistorias'

function historia(clave: string, cambios: Partial<Historia> = {}): Historia {
  return {
    clave,
    nombre: clave,
    anio: 1976,
    areaFondo: 'marketing',
    combinacion: 'Ingeniería + Ventas',
    frase: { inicio: 'Uno construía. El otro', resaltado: 'vendía', fin: '.' },
    personas: [
      { iniciales: 'AA', nombre: 'Ana', area: 'marketing', aporte: 'Ventas' },
      { iniciales: 'BB', nombre: 'Beto', area: 'tecnologia', aporte: 'Ingeniería' },
    ],
    parrafos: ['Se conocieron.'],
    fuentes: [{ texto: 'Fuente', href: 'https://example.com/historia' }],
    ...cambios,
  }
}

describe('obtenerHistorias', () => {
  it('devuelve las historias que se pueden publicar, en el idioma pedido', async () => {
    let idiomaPedido = ''
    const repositorio: HistoriasRepository = {
      obtener: async (idioma) => {
        idiomaPedido = idioma
        return [historia('a'), historia('b', { parrafos: [] })]
      },
    }
    const resultado = await obtenerHistorias(repositorio, 'pt', 2026)
    expect(idiomaPedido).toBe('pt')
    expect(resultado).toEqual({ ok: true, historias: [historia('a')] })
  })

  it('con el año que recibe decide si una historia es del futuro', async () => {
    const repositorio: HistoriasRepository = { obtener: async () => [historia('a', { anio: 2030 })] }
    expect(await obtenerHistorias(repositorio, 'es', 2026)).toEqual({ ok: true, historias: [] })
    expect(await obtenerHistorias(repositorio, 'es', 2030)).toMatchObject({ ok: true, historias: [{ clave: 'a' }] })
  })

  it('si el adaptador falla, lo dice con un resultado y no deja que se rompa la página', async () => {
    const repositorio: HistoriasRepository = {
      obtener: async () => {
        throw new Error('sin red')
      },
    }
    expect(await obtenerHistorias(repositorio, 'es', 2026)).toEqual({ ok: false, motivo: 'fallo' })
  })
})
