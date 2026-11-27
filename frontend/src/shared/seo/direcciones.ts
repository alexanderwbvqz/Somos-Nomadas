import { esIdioma, idiomaPorDefecto, idiomas, type Idioma } from '@/shared/idiomas/idiomas'

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

// Una ruta de la web sin el idioma: vacía (la portada) o tramos «/algo», sin barra final, consulta ni fragmento
const FORMA_DE_RUTA = /^(\/[A-Za-z0-9_-]+)*$/

/**
 * La dirección canónica de una página en `idioma` y sus versiones en los demás idiomas (hreflang), más `x-default`
 * en el idioma por defecto. Son rutas relativas: Next las completa con la dirección del sitio (`metadataBase`).
 */
export function enlacesDeIdioma(idioma: Idioma, ruta: string): EnlacesDeIdioma {
  const primerTramo = ruta.split('/')[1] ?? ''
  if (!FORMA_DE_RUTA.test(ruta) || esIdioma(primerTramo)) {
    throw new Error(`La ruta «${ruta}» no vale: va sin idioma, empieza por «/» y no termina en «/»`)
  }
  const en = (otro: Idioma) => `/${otro}${ruta}`
  const languages = Object.fromEntries(idiomas.map((otro) => [otro, en(otro)])) as Record<Idioma, string>
  return { canonical: en(idioma), languages: { ...languages, 'x-default': en(idiomaPorDefecto) } }
}

export type EnlacesDeIdioma = { canonical: string; languages: Record<Idioma | 'x-default', string> }
