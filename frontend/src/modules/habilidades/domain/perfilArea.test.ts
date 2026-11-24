import { describe, expect, it } from 'vitest'
import {
  calcularArea,
  CANTIDAD_FUERTES,
  habilidadesMasFuertes,
  MAX_HABILIDADES,
  ordenarPorFuerza,
  puntuar,
  type HabilidadPuntuada,
  type Marcas,
} from './perfilArea'

describe('ordenarPorFuerza', () => {
  it('pone primero las que hizo más veces; con las mismas veces, el orden del catálogo', () => {
    const marcas: Marcas = { ventas: 'unaVez', desarrolloWeb: 'unaVez', backendApis: 'esMiTrabajo', finanzasContabilidad: 'variasVeces' }
    expect(ordenarPorFuerza(marcas)).toEqual(['backendApis', 'finanzasContabilidad', 'desarrolloWeb', 'ventas'])
  })

  it('solo salen las marcadas', () => {
    expect(ordenarPorFuerza({})).toEqual([])
    expect(ordenarPorFuerza({ ventas: 'unaVez' })).toEqual(['ventas'])
  })
})

describe('habilidadesMasFuertes', () => {
  it('son las tres primeras', () => {
    const marcas: Marcas = { ventas: 'esMiTrabajo', desarrolloWeb: 'variasVeces', backendApis: 'variasVeces', finanzasContabilidad: 'unaVez' }
    expect(CANTIDAD_FUERTES).toBe(3)
    expect(habilidadesMasFuertes(marcas)).toEqual(['ventas', 'desarrolloWeb', 'backendApis'])
  })

  it('con menos de tres marcadas, las que haya', () => {
    expect(habilidadesMasFuertes({ ventas: 'unaVez' })).toEqual(['ventas'])
  })
})

describe('puntuar', () => {
  it('da los puntos de cada una, usando el tiempo cuando se sabe', () => {
    const puntuadas = puntuar({ desarrolloWeb: 'esMiTrabajo', ventas: 'unaVez' }, { desarrolloWeb: 'masDeCincoAnos' })
    expect(puntuadas).toEqual([
      { habilidad: 'desarrolloWeb', frecuencia: 'esMiTrabajo', puntos: 5, estimado: false },
      { habilidad: 'ventas', frecuencia: 'unaVez', puntos: 1, estimado: true },
    ])
  })

  it('tiene en cuenta como mucho seis habilidades: las más fuertes', () => {
    const marcas: Marcas = {
      desarrolloWeb: 'unaVez',
      desarrolloMovil: 'unaVez',
      backendApis: 'unaVez',
      inteligenciaArtificial: 'unaVez',
      ciberseguridad: 'unaVez',
      devopsNube: 'unaVez',
      ventas: 'esMiTrabajo',
    }
    const puntuadas = puntuar(marcas, {})
    expect(MAX_HABILIDADES).toBe(6)
    expect(puntuadas).toHaveLength(6)
    expect(puntuadas[0]?.habilidad).toBe('ventas')
    // Seis habilidades empatan en una vez: se queda fuera la que va última en el orden del catálogo (el de los grupos)
    expect(puntuadas.map((p) => p.habilidad)).not.toContain('inteligenciaArtificial')
    expect(puntuadas.map((p) => p.habilidad)).toEqual(expect.arrayContaining(['desarrolloWeb', 'desarrolloMovil', 'backendApis', 'devopsNube', 'ciberseguridad']))
  })
})

function p(habilidad: HabilidadPuntuada['habilidad'], puntos: HabilidadPuntuada['puntos']): HabilidadPuntuada {
  return { habilidad, frecuencia: 'unaVez', puntos, estimado: false }
}

describe('calcularArea', () => {
  it('sin habilidades no hay resultado', () => {
    expect(calcularArea([])).toBeUndefined()
  })

  it('gana el área con más puntos y el reparto va de más a menos', () => {
    const resultado = calcularArea([p('desarrolloWeb', 4), p('backendApis', 3), p('ventas', 1), p('finanzasContabilidad', 2)])
    expect(resultado?.areas).toEqual(['tecnologia'])
    expect(resultado?.mixto).toBe(false)
    expect(resultado?.reparto.map((r) => r.area)).toEqual(['tecnologia', 'finanzas', 'ventasMarketing', 'operaciones'])
    expect(resultado?.reparto[0]?.porcentaje).toBe(70)
    expect(resultado?.reparto[3]?.porcentaje).toBe(0)
  })

  it('el reparto suma 100, con el margen del redondeo', () => {
    const resultado = calcularArea([p('desarrolloWeb', 1), p('ventas', 1), p('finanzasContabilidad', 1)])
    const suma = resultado?.reparto.reduce((total, r) => total + r.porcentaje, 0) ?? 0
    expect(suma).toBeGreaterThanOrEqual(99)
    expect(suma).toBeLessThanOrEqual(101)
  })

  it('con empate en puntos gana el área que pesa más entre las tres habilidades más fuertes', () => {
    // Tecnología: 1+1+1+1 = 4 · Ventas y Marketing: 3+1 = 4. Entre las tres más fuertes (3, 1, 1): ventas 3 contra tecnología 2
    const resultado = calcularArea([p('desarrolloWeb', 1), p('desarrolloMovil', 1), p('backendApis', 1), p('inteligenciaArtificial', 1), p('ventas', 3), p('marketingDigital', 1)])
    expect(resultado?.areas).toEqual(['ventasMarketing'])
    expect(resultado?.mixto).toBe(false)
  })

  it('si el empate sigue, devuelve las áreas que empatan y lo marca como mixto', () => {
    const resultado = calcularArea([p('desarrolloWeb', 2), p('ventas', 2)])
    expect(resultado?.areas).toEqual(['tecnologia', 'ventasMarketing'])
    expect(resultado?.mixto).toBe(true)
  })

  it('un empate a tres se queda con las que siguen empatadas tras el desempate', () => {
    const resultado = calcularArea([p('desarrolloWeb', 2), p('ventas', 2), p('finanzasContabilidad', 2)])
    expect(resultado?.areas).toEqual(['tecnologia', 'ventasMarketing', 'finanzas'])
    expect(resultado?.mixto).toBe(true)
  })

  it('lo que elige la persona manda sobre el cálculo y deja de ser mixto', () => {
    const resultado = calcularArea([p('desarrolloWeb', 2), p('ventas', 2)], 'finanzas')
    expect(resultado?.areas).toEqual(['finanzas'])
    expect(resultado?.mixto).toBe(false)
    expect(resultado?.reparto).toHaveLength(4)
  })

  it('una habilidad sola da su área sin empate', () => {
    const resultado = calcularArea([p('levantamientoCapital', 2)])
    expect(resultado?.areas).toEqual(['finanzas'])
    expect(resultado?.reparto[0]).toEqual({ area: 'finanzas', porcentaje: 100 })
  })
})
