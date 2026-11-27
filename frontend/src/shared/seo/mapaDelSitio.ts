import type { MetadataRoute } from 'next'
import { idiomas } from '@/shared/idiomas/idiomas'
import { enlacesDeIdioma } from './direcciones'

/**
 * Las entradas de sitemap.xml: cada ruta pública en cada idioma, con su dirección absoluta y enlazada a sus versiones
 * en los demás idiomas. Sin fecha de modificación: no la tenemos de verdad, y una inventada confunde a los buscadores.
 */
export function entradasDelMapa(urlSitio: URL, rutas: readonly string[]): MetadataRoute.Sitemap {
  const absoluta = (ruta: string) => new URL(ruta, urlSitio).href
  return rutas.flatMap((ruta) =>
    idiomas.map((idioma) => {
      const { canonical, languages } = enlacesDeIdioma(idioma, ruta)
      return {
        url: absoluta(canonical),
        alternates: { languages: Object.fromEntries(Object.entries(languages).map(([clave, valor]) => [clave, absoluta(valor)])) },
      }
    }),
  )
}

/**
 * robots.txt: deja pasar a todos y señala el mapa. Las páginas privadas no se bloquean aquí a propósito: llevan
 * `noindex`, y un buscador bloqueado no puede leerlo (y podría indexar la dirección igual).
 */
export function reglasDeRobots(urlSitio: URL): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/' }, sitemap: new URL('/sitemap.xml', urlSitio).href }
}
