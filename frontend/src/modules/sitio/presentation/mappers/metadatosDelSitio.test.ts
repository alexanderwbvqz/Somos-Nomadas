import { describe, expect, it } from 'vitest'
import { en } from '../../language/en'
import { es } from '../../language/es'
import { pt } from '../../language/pt'
import { metadatosDelSitio } from './metadatosDelSitio'

const URL_SITIO = new URL('https://somosnomadas.app')
const ICONO = '/logo/logo_isotipo.svg'

describe('metadatosDelSitio', () => {
  it('la portada se titula con la marca y cada página «Su título | Somos Nómadas»', () => {
    const metadatos = metadatosDelSitio(es, { urlSitio: URL_SITIO, icono: ICONO })

    expect(metadatos.title).toEqual({ default: 'Somos Nómadas', template: '%s | Somos Nómadas' })
  })

  it('la descripción por defecto (la de la portada) es la del pie, en el idioma de la página', () => {
    expect(metadatosDelSitio(es, { urlSitio: URL_SITIO, icono: ICONO }).description).toBe(es.pie.descripcion)
    expect(metadatosDelSitio(en, { urlSitio: URL_SITIO, icono: ICONO }).description).toBe(en.pie.descripcion)
    expect(metadatosDelSitio(pt, { urlSitio: URL_SITIO, icono: ICONO }).description).toBe(pt.pie.descripcion)
  })

  it('lleva el icono de la pestaña y la dirección base de los enlaces absolutos', () => {
    const metadatos = metadatosDelSitio(es, { urlSitio: URL_SITIO, icono: ICONO })

    expect(metadatos.icons).toEqual({ icon: ICONO })
    expect(metadatos.metadataBase).toBe(URL_SITIO)
  })

  it('la marca es la misma en los tres idiomas', () => {
    expect(new Set([es.marca, en.marca, pt.marca])).toEqual(new Set(['Somos Nómadas']))
  })
})
