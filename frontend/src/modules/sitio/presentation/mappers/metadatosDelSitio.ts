import type { Metadata } from 'next'
import type { Idioma } from '@/shared/idiomas/idiomas'
import type { TextosSitio } from '../../language/tipos'

type Opciones = {
  /** El origen del sitio: base de los enlaces absolutos */
  urlSitio: URL
  /** El icono de la pestaña (y el que muestran los buscadores junto al resultado) */
  icono: string
  idioma: Idioma
}

// El idioma de la tarjeta al compartir (Open Graph). Español de Latinoamérica: la comunidad es latinoamericana
const LOCALE: Record<Idioma, string> = { es: 'es_LA', en: 'en_US', pt: 'pt_BR' }

/**
 * Los metadatos comunes a todas las páginas de un idioma. La portada se titula con la marca; las demás páginas dan
 * solo su título y la plantilla añade la marca («Crear cuenta | Somos Nómadas»), que así vive en un solo sitio.
 */
export function metadatosDelSitio(textos: TextosSitio, { urlSitio, icono, idioma }: Opciones): Metadata {
  return {
    metadataBase: urlSitio,
    title: { default: textos.marca, template: `%s | ${textos.marca}` },
    description: textos.pie.descripcion,
    icons: { icon: icono },
    // La tarjeta al compartir un enlace (WhatsApp, LinkedIn, Slack…). La imagen la pone opengraph-image.tsx
    openGraph: {
      type: 'website',
      siteName: textos.marca,
      title: textos.marca,
      description: textos.pie.descripcion,
      locale: LOCALE[idioma],
    },
    twitter: { card: 'summary_large_image' },
  }
}
