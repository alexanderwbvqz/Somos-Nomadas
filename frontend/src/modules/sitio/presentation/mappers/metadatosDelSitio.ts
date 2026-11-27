import type { Metadata } from 'next'
import type { TextosSitio } from '../../language/tipos'

type Opciones = {
  /** El origen del sitio: base de los enlaces absolutos */
  urlSitio: URL
  /** El icono de la pestaña (y el que muestran los buscadores junto al resultado) */
  icono: string
}

/**
 * Los metadatos comunes a todas las páginas de un idioma. La portada se titula con la marca; las demás páginas dan
 * solo su título y la plantilla añade la marca («Crear cuenta | Somos Nómadas»), que así vive en un solo sitio.
 */
export function metadatosDelSitio(textos: TextosSitio, { urlSitio, icono }: Opciones): Metadata {
  return {
    metadataBase: urlSitio,
    title: { default: textos.marca, template: `%s | ${textos.marca}` },
    description: textos.pie.descripcion,
    icons: { icon: icono },
  }
}
