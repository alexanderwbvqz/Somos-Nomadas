import type { MetadataRoute } from 'next'
import { reglasDeRobots } from '@/shared/seo/mapaDelSitio'
import { urlDelSitio } from '@/shared/seo/direcciones'

// /robots.txt
export default function robots(): MetadataRoute.Robots {
  return reglasDeRobots(urlDelSitio(process.env.NEXT_PUBLIC_URL_SITIO))
}
