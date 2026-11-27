import type { MetadataRoute } from 'next'
import { rutasPublicas } from '@/composition/sitio/mapaDelSitio'
import { entradasDelMapa } from '@/shared/seo/mapaDelSitio'
import { urlDelSitio } from '@/shared/seo/direcciones'

// /sitemap.xml: las páginas públicas en sus tres idiomas, para los buscadores
export default function sitemap(): MetadataRoute.Sitemap {
  return entradasDelMapa(urlDelSitio(process.env.NEXT_PUBLIC_URL_SITIO), rutasPublicas())
}
