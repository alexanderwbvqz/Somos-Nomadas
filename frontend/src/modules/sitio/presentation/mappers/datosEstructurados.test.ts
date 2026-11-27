import { describe, expect, it } from 'vitest'
import { en } from '../../language/en'
import { es } from '../../language/es'
import { datosEstructurados } from './datosEstructurados'

const SITIO = new URL('https://somosnomadas.app')
const LOGO = '/logo/logo_isotipo.svg'

describe('datosEstructurados', () => {
  it('describe la organización y el sitio web, con direcciones absolutas, en el idioma de la página', () => {
    expect(datosEstructurados(es, { urlSitio: SITIO, idioma: 'es', logo: LOGO })).toEqual({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': 'https://somosnomadas.app/#organizacion',
          name: 'Somos Nómadas',
          url: 'https://somosnomadas.app/',
          logo: 'https://somosnomadas.app/logo/logo_isotipo.svg',
          description: es.pie.descripcion,
        },
        {
          '@type': 'WebSite',
          '@id': 'https://somosnomadas.app/es#sitio',
          name: 'Somos Nómadas',
          url: 'https://somosnomadas.app/es',
          inLanguage: 'es',
          publisher: { '@id': 'https://somosnomadas.app/#organizacion' },
        },
      ],
    })
  })

  it('en inglés cambian la descripción, el idioma y la dirección del sitio; la organización es la misma', () => {
    const datos = datosEstructurados(en, { urlSitio: SITIO, idioma: 'en', logo: LOGO })
    const [organizacion, sitio] = datos['@graph']

    expect(organizacion).toMatchObject({ '@id': 'https://somosnomadas.app/#organizacion', description: en.pie.descripcion })
    expect(sitio).toMatchObject({ '@id': 'https://somosnomadas.app/en#sitio', url: 'https://somosnomadas.app/en', inLanguage: 'en' })
  })

  it('no inventa redes sociales ni datos de contacto que no tenemos', () => {
    const texto = JSON.stringify(datosEstructurados(es, { urlSitio: SITIO, idioma: 'es', logo: LOGO }))

    for (const campo of ['sameAs', 'contactPoint', 'telephone', 'email', 'address']) expect(texto).not.toContain(campo)
  })
})
