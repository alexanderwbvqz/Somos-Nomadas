import { describe, expect, it } from 'vitest'
import { en } from '../../language/en'
import { es } from '../../language/es'
import { pt } from '../../language/pt'
import { metadatosDelSitio } from './metadatosDelSitio'

const URL_SITIO = new URL('https://somosnomadas.app')
const ICONO = '/logo/logo_isotipo.svg'

describe('metadatosDelSitio', () => {
  it('la portada se titula con la marca y cada página «Su título | Somos Nómadas»', () => {
    const metadatos = metadatosDelSitio(es, { urlSitio: URL_SITIO, icono: ICONO, idioma: 'es' })

    expect(metadatos.title).toEqual({ default: 'Somos Nómadas', template: '%s | Somos Nómadas' })
  })

  it('la descripción por defecto (la de la portada) es la del pie, en el idioma de la página', () => {
    expect(metadatosDelSitio(es, { urlSitio: URL_SITIO, icono: ICONO, idioma: 'es' }).description).toBe(es.pie.descripcion)
    expect(metadatosDelSitio(en, { urlSitio: URL_SITIO, icono: ICONO, idioma: 'en' }).description).toBe(en.pie.descripcion)
    expect(metadatosDelSitio(pt, { urlSitio: URL_SITIO, icono: ICONO, idioma: 'pt' }).description).toBe(pt.pie.descripcion)
  })

  it('lleva el icono de la pestaña y la dirección base de los enlaces absolutos', () => {
    const metadatos = metadatosDelSitio(es, { urlSitio: URL_SITIO, icono: ICONO, idioma: 'es' })

    expect(metadatos.icons).toEqual({ icon: ICONO })
    expect(metadatos.metadataBase).toBe(URL_SITIO)
  })

  it('al compartir un enlace, la tarjeta lleva el nombre del sitio, el título, la descripción y el idioma', () => {
    const metadatos = metadatosDelSitio(pt, { urlSitio: URL_SITIO, icono: ICONO, idioma: 'pt' })

    expect(metadatos.openGraph).toEqual({
      type: 'website',
      siteName: 'Somos Nómadas',
      title: 'Somos Nómadas',
      description: pt.pie.descripcion,
      locale: 'pt_BR',
    })
    expect(metadatos.twitter).toEqual({ card: 'summary_large_image' })
  })

  it.each([
    ['es', 'es_LA'],
    ['en', 'en_US'],
    ['pt', 'pt_BR'],
  ] as const)('el idioma %s se anuncia como %s', (idioma, locale) => {
    const metadatos = metadatosDelSitio(es, { urlSitio: URL_SITIO, icono: ICONO, idioma })

    expect(metadatos.openGraph).toMatchObject({ locale })
  })

  it('la marca es la misma en los tres idiomas', () => {
    expect(new Set([es.marca, en.marca, pt.marca])).toEqual(new Set(['Somos Nómadas']))
  })
})
