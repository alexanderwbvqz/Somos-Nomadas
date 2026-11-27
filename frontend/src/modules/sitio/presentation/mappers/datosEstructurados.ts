import type { Idioma } from '@/shared/idiomas/idiomas'
import type { TextosSitio } from '../../language/tipos'

type Opciones = { urlSitio: URL; idioma: Idioma; logo: string }

/**
 * Los datos estructurados (schema.org) de la portada: quién es la organización y cuál es su sitio. Con ellos los
 * buscadores pueden mostrar el nombre y el logo junto al resultado. Solo lo que sabemos: sin redes ni contacto.
 */
export function datosEstructurados(textos: TextosSitio, { urlSitio, idioma, logo }: Opciones) {
  const absoluta = (ruta: string) => new URL(ruta, urlSitio).href
  const organizacion = absoluta('/#organizacion')
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizacion,
        name: textos.marca,
        url: absoluta('/'),
        logo: absoluta(logo),
        description: textos.pie.descripcion,
      },
      {
        '@type': 'WebSite',
        '@id': absoluta(`/${idioma}#sitio`),
        name: textos.marca,
        url: absoluta(`/${idioma}`),
        inLanguage: idioma,
        publisher: { '@id': organizacion },
      },
    ],
  }
}
