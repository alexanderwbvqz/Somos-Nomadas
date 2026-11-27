// La dirección pública del sitio: la base de los enlaces absolutos (canónica, idiomas, sitemap, imagen para compartir).
// Se lee de NEXT_PUBLIC_URL_SITIO (https://somosnomadas.app en producción); en local, el servidor de desarrollo.

const EN_LOCAL = 'http://localhost:3000'

/** El origen del sitio. Una dirección mal escrita falla al compilar: mejor eso que publicar enlaces rotos */
export function urlDelSitio(valor: string | undefined): URL {
  const limpio = valor?.trim() ?? ''
  if (limpio === '') return new URL(EN_LOCAL)
  let url: URL
  try {
    url = new URL(limpio)
  } catch {
    throw new Error('NEXT_PUBLIC_URL_SITIO no es una dirección válida (por ejemplo, https://somosnomadas.app)')
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('NEXT_PUBLIC_URL_SITIO debe empezar por https:// (o http:// en local)')
  }
  return new URL(url.origin)
}
