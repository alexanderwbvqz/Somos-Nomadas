import { describe, expect, it } from 'vitest'
import {
  alternarBusqueda,
  datosBienvenidaVacios,
  LIMITES_BIENVENIDA,
  limpiarBienvenida,
  validarBienvenida,
  type DatosBienvenida,
} from './bienvenida'

function completos(): DatosBienvenida {
  return { nombre: 'Ana', apellidos: 'Torres Rojas', pais: 'PE', ciudad: '', busca: ['socioTecnico'] }
}

describe('validarBienvenida', () => {
  it('acepta los datos completos, con la ciudad vacía', () => {
    expect(validarBienvenida(completos())).toEqual({})
  })

  it('pide nombre, apellidos, país y al menos una opción cuando está vacío', () => {
    expect(validarBienvenida(datosBienvenidaVacios())).toEqual({
      nombre: 'obligatorio',
      apellidos: 'obligatorio',
      pais: 'obligatorio',
      busca: 'busquedaVacia',
    })
  })

  it('un nombre de solo espacios cuenta como vacío', () => {
    expect(validarBienvenida({ ...completos(), nombre: '   ' }).nombre).toBe('obligatorio')
  })

  it('rechaza textos que pasan el límite, ciudad incluida', () => {
    const largo = 'a'.repeat(LIMITES_BIENVENIDA.ciudad + 1)
    expect(validarBienvenida({ ...completos(), ciudad: largo }).ciudad).toBe('textoLargo')
    expect(validarBienvenida({ ...completos(), nombre: 'a'.repeat(LIMITES_BIENVENIDA.nombre + 1) }).nombre).toBe('textoLargo')
    expect(validarBienvenida({ ...completos(), apellidos: 'a'.repeat(LIMITES_BIENVENIDA.apellidos + 1) }).apellidos).toBe('textoLargo')
  })

  it('un país que no está en la lista no vale', () => {
    expect(validarBienvenida({ ...completos(), pais: 'XX' as never }).pais).toBe('obligatorio')
  })
})

describe('limpiarBienvenida', () => {
  it('recorta, junta espacios repetidos y ordena las opciones sin repetirlas', () => {
    const perfil = limpiarBienvenida({
      nombre: '  Ana  María ',
      apellidos: ' Torres   Rojas',
      pais: 'PE',
      ciudad: '  Lima ',
      busca: ['explorando', 'socioTecnico', 'explorando'],
    })
    expect(perfil).toEqual({
      nombre: 'Ana María',
      apellidos: 'Torres Rojas',
      pais: 'PE',
      ciudad: 'Lima',
      busca: ['socioTecnico', 'explorando'],
    })
  })
})

describe('alternarBusqueda', () => {
  it('marca y desmarca', () => {
    expect(alternarBusqueda([], 'socioTecnico')).toEqual(['socioTecnico'])
    expect(alternarBusqueda(['socioTecnico'], 'socioTecnico')).toEqual([])
  })

  it('no pasa del tope, pero sí deja desmarcar estando en él', () => {
    const cuatro = ['socioTecnico', 'socioComercial', 'alguienConIdea', 'sumarmeAIdea'] as const
    expect(alternarBusqueda([...cuatro], 'explorando')).toEqual([...cuatro])
    expect(alternarBusqueda([...cuatro], 'socioComercial')).toHaveLength(3)
  })
})
