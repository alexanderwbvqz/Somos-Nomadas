import { beforeEach, describe, expect, it } from 'vitest'
import type { PerfilRepository } from '../domain/PerfilRepository'
import { datosBienvenidaVacios, type DatosBienvenida } from '../domain/perfil'
import { MockPerfilRepository } from '../infrastructure/mock/MockPerfilRepository'
import { guardarBienvenida } from './guardarBienvenida'

function completos(): DatosBienvenida {
  return { nombre: ' Ana ', apellidos: 'Torres Rojas', pais: 'PE', ciudad: ' Lima', busca: ['socioTecnico'] }
}

describe('guardarBienvenida', () => {
  beforeEach(() => MockPerfilRepository.vaciar())

  it('guarda el perfil ya limpio y devuelve el nombre', async () => {
    expect(await guardarBienvenida(new MockPerfilRepository(), completos())).toEqual({ ok: true, nombre: 'Ana' })
    expect(MockPerfilRepository.guardado()).toEqual({
      nombre: 'Ana',
      apellidos: 'Torres Rojas',
      pais: 'PE',
      ciudad: 'Lima',
      busca: ['socioTecnico'],
    })
  })

  it('devuelve los errores y no guarda nada si los datos no son válidos', async () => {
    const resultado = await guardarBienvenida(new MockPerfilRepository(), datosBienvenidaVacios())
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) expect(resultado.errores).toMatchObject({ nombre: 'obligatorio', pais: 'obligatorio', busca: 'busquedaVacia' })
    expect(MockPerfilRepository.guardado()).toBeUndefined()
  })

  it('si el repositorio falla, avisa con "fallo" y no con errores de datos', async () => {
    const roto: PerfilRepository = {
      guardarBienvenida: async () => { throw new Error('x') },
      obtenerBienvenida: async () => { throw new Error('x') },
    }
    expect(await guardarBienvenida(roto, completos())).toEqual({ ok: false, errores: {}, motivo: 'fallo' })
  })
})
