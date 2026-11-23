import { describe, expect, it } from 'vitest'
import { datosHistoriasVacios, hayTexto, LIMITES_HISTORIAS, limpiarHistorias, validarHistorias, type EntradaHistorias } from './historias'

function conTexto(): EntradaHistorias {
  return { ...datosHistoriasVacios(), logro: 'Armé una tienda en línea', aceptaAnalisis: true }
}

describe('hayTexto', () => {
  it('es verdad si hay algo escrito en cualquiera de los tres', () => {
    expect(hayTexto({ logro: '', problemaDificil: 'x', problemaMundo: '' })).toBe(true)
  })

  it('con todo vacío, o solo con espacios, no hay texto', () => {
    expect(hayTexto({ logro: '', problemaDificil: '', problemaMundo: '' })).toBe(false)
    expect(hayTexto({ logro: '   ', problemaDificil: '\n', problemaMundo: ' ' })).toBe(false)
  })
})

describe('validarHistorias', () => {
  it('todo vacío es válido: es opcional', () => {
    expect(validarHistorias(datosHistoriasVacios())).toEqual({})
  })

  it('con texto y permiso es válido', () => {
    expect(validarHistorias(conTexto())).toEqual({})
  })

  it('si escribió algo sin dar el permiso, falta el permiso', () => {
    expect(validarHistorias({ ...conTexto(), aceptaAnalisis: false })).toEqual({ aceptaAnalisis: 'faltaPermiso' })
  })

  it('sin escribir nada no hace falta el permiso', () => {
    expect(validarHistorias({ ...datosHistoriasVacios(), aceptaAnalisis: false })).toEqual({})
  })

  it('un texto vale hasta el límite y ni uno más, contando sin los espacios de los extremos', () => {
    const largo = 'a'.repeat(LIMITES_HISTORIAS.texto + 1)
    expect(validarHistorias({ ...conTexto(), logro: 'a'.repeat(LIMITES_HISTORIAS.texto) })).toEqual({})
    expect(validarHistorias({ ...conTexto(), logro: ` ${'a'.repeat(LIMITES_HISTORIAS.texto)} ` })).toEqual({})
    expect(validarHistorias({ ...conTexto(), problemaDificil: largo })).toEqual({ problemaDificil: 'textoLargo' })
    expect(validarHistorias({ ...conTexto(), problemaMundo: largo })).toEqual({ problemaMundo: 'textoLargo' })
  })

  it('acepta hasta cinco sectores y no más', () => {
    const cinco = ['salud', 'educacion', 'agro', 'turismo', 'moda']
    expect(validarHistorias({ ...datosHistoriasVacios(), sectores: cinco })).toEqual({})
    expect(validarHistorias({ ...datosHistoriasVacios(), sectores: [...cinco, 'fintech'] })).toEqual({ sectores: 'demasiadosSectores' })
  })

  it('rechaza un sector que no existe o repetido', () => {
    expect(validarHistorias({ ...datosHistoriasVacios(), sectores: ['salud', 'astrologia'] })).toEqual({ sectores: 'sectorInvalido' })
    expect(validarHistorias({ ...datosHistoriasVacios(), sectores: ['salud', 'salud'] })).toEqual({ sectores: 'sectorInvalido' })
  })

  it('puede tener varios errores a la vez', () => {
    const errores = validarHistorias({ ...conTexto(), aceptaAnalisis: false, sectores: ['nada'], logro: 'a'.repeat(5000) })
    expect(Object.keys(errores).sort()).toEqual(['aceptaAnalisis', 'logro', 'sectores'])
  })
})

describe('limpiarHistorias', () => {
  it('recorta los textos y deja los sectores en el orden de la lista', () => {
    const limpias = limpiarHistorias({ ...conTexto(), logro: '  Armé una tienda  ', sectores: ['moda', 'salud', 'agro'] })
    expect(limpias.logro).toBe('Armé una tienda')
    expect(limpias.sectores).toEqual(['salud', 'agro', 'moda'])
    expect(limpias.aceptaAnalisis).toBe(true)
  })
})
