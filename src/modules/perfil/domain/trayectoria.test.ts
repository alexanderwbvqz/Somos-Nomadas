import { describe, expect, it } from 'vitest'
import {
  hayErroresTrayectoria,
  LIMITES_TRAYECTORIA,
  limpiarTrayectoria,
  validarEntradaTrayectoria,
  validarTrayectoria,
  type EntradaTrayectoriaForm,
} from './trayectoria'

const ANIO = 2026

function entrada(cambios: Partial<EntradaTrayectoriaForm> = {}): EntradaTrayectoriaForm {
  return { desde: '2020', hasta: '2022', rol: 'Desarrolladora', donde: 'Estudio digital', que: 'Páginas web.', ...cambios }
}

describe('validarEntradaTrayectoria', () => {
  it('acepta una entrada completa', () => {
    expect(validarEntradaTrayectoria(entrada(), ANIO)).toEqual({})
  })

  it('«hasta» vacío quiere decir que sigue ahí, y «qué hiciste» es opcional', () => {
    expect(validarEntradaTrayectoria(entrada({ hasta: '', que: '' }), ANIO)).toEqual({})
  })

  it('terminar el mismo año en que empezó es válido', () => {
    expect(validarEntradaTrayectoria(entrada({ desde: '2021', hasta: '2021' }), ANIO)).toEqual({})
  })

  it('pide el año de inicio, el rol y el dónde', () => {
    expect(validarEntradaTrayectoria(entrada({ desde: '', rol: '  ', donde: '' }), ANIO)).toEqual({
      desde: 'obligatorio',
      rol: 'obligatorio',
      donde: 'obligatorio',
    })
  })

  it('los años deben tener cuatro cifras y estar entre el mínimo y el año actual', () => {
    for (const mal of ['202', 'dos mil', '20200', '1959', String(ANIO + 1)]) {
      expect(validarEntradaTrayectoria(entrada({ desde: mal }), ANIO).desde, mal).toBe('anioInvalido')
    }
    expect(validarEntradaTrayectoria(entrada({ desde: String(LIMITES_TRAYECTORIA.anioMinimo) }), ANIO).desde).toBeUndefined()
    expect(validarEntradaTrayectoria(entrada({ desde: String(ANIO), hasta: '' }), ANIO).desde).toBeUndefined()
  })

  it('los espacios alrededor del año no cuentan', () => {
    expect(validarEntradaTrayectoria(entrada({ desde: ' 2020 ', hasta: ' 2022 ' }), ANIO)).toEqual({})
  })

  it('el año de término no puede ser anterior al de inicio ni futuro', () => {
    expect(validarEntradaTrayectoria(entrada({ desde: '2022', hasta: '2020' }), ANIO).hasta).toBe('anteriorAlInicio')
    expect(validarEntradaTrayectoria(entrada({ hasta: String(ANIO + 1) }), ANIO).hasta).toBe('anioInvalido')
    expect(validarEntradaTrayectoria(entrada({ hasta: 'ayer' }), ANIO).hasta).toBe('anioInvalido')
  })

  it('si el inicio ya está mal no se compara con el término', () => {
    expect(validarEntradaTrayectoria(entrada({ desde: 'abcd', hasta: '2020' }), ANIO)).toEqual({ desde: 'anioInvalido' })
  })

  it('rechaza los textos que pasan el máximo', () => {
    const e = validarEntradaTrayectoria(
      entrada({
        rol: 'a'.repeat(LIMITES_TRAYECTORIA.rol + 1),
        donde: 'a'.repeat(LIMITES_TRAYECTORIA.donde + 1),
        que: 'a'.repeat(LIMITES_TRAYECTORIA.que + 1),
      }),
      ANIO,
    )
    expect(e).toEqual({ rol: 'textoLargo', donde: 'textoLargo', que: 'textoLargo' })
    expect(validarEntradaTrayectoria(entrada({ rol: 'a'.repeat(LIMITES_TRAYECTORIA.rol) }), ANIO).rol).toBeUndefined()
  })
})

describe('validarTrayectoria', () => {
  it('una lista vacía es válida: la trayectoria es opcional', () => {
    const errores = validarTrayectoria([], ANIO)
    expect(errores).toEqual({ entradas: {} })
    expect(hayErroresTrayectoria(errores)).toBe(false)
  })

  it('acepta hasta cinco entradas y rechaza la sexta', () => {
    const cinco = Array.from({ length: LIMITES_TRAYECTORIA.entradas }, () => entrada())
    expect(hayErroresTrayectoria(validarTrayectoria(cinco, ANIO))).toBe(false)
    const seis = [...cinco, entrada()]
    expect(validarTrayectoria(seis, ANIO).lista).toBe('demasiadasEntradas')
  })

  it('dice qué entrada falla, por su lugar en la lista', () => {
    const errores = validarTrayectoria([entrada(), entrada({ rol: '' }), entrada({ desde: '' })], ANIO)
    expect(errores.entradas).toEqual({ 1: { rol: 'obligatorio' }, 2: { desde: 'obligatorio' } })
    expect(hayErroresTrayectoria(errores)).toBe(true)
  })
})

describe('limpiarTrayectoria', () => {
  it('pasa los años a número, junta espacios repetidos y omite «hasta» cuando sigue ahí', () => {
    const [una] = limpiarTrayectoria([entrada({ desde: ' 2022 ', hasta: '', rol: '  Dev   web ', donde: ' Mi   proyecto', que: '  ' })])
    expect(una).toEqual({ desde: 2022, rol: 'Dev web', donde: 'Mi proyecto', que: '' })
    expect('hasta' in (una ?? {})).toBe(false)
  })

  it('las deja de la más reciente a la más antigua, y la que sigue en curso antes que otra del mismo año', () => {
    const lista = limpiarTrayectoria([
      entrada({ desde: '2018', hasta: '2019', rol: 'A' }),
      entrada({ desde: '2022', hasta: '2023', rol: 'B' }),
      entrada({ desde: '2022', hasta: '', rol: 'C' }),
    ])
    expect(lista.map((e) => e.rol)).toEqual(['C', 'B', 'A'])
  })

  it('no cambia la lista que recibe', () => {
    const original = [entrada({ desde: '2018' }), entrada({ desde: '2022' })]
    limpiarTrayectoria(original)
    expect(original.map((e) => e.desde)).toEqual(['2018', '2022'])
  })
})
