import { writeFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

// Lo que ven los buscadores y el navegador en el <head> de la página compilada: el título con la marca, la
// descripción y el icono de la pestaña.

test.describe('marca y metadatos', () => {
  test('la portada se titula con la marca, describe la comunidad y trae el icono naranja', async ({ page, request }) => {
    await page.goto('/es')

    await expect(page).toHaveTitle('Somos Nómadas')
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      'Comunidad abierta que conecta emprendedores con talento complementario para fundar empresas.',
    )
    const icono = page.locator('link[rel="icon"]')
    await expect(icono).toHaveAttribute('href', '/logo/logo_isotipo.svg')
    const respuesta = await request.get('/logo/logo_isotipo.svg')
    expect(respuesta.status()).toBe(200)
    expect(await respuesta.text()).toContain('#FE412A')
  })

  test('cada página dice su título seguido de la marca, una sola vez, en su idioma', async ({ page }) => {
    await page.goto('/es/registro')
    await expect(page).toHaveTitle('Crear cuenta | Somos Nómadas')

    await page.goto('/en/iniciar-sesion')
    await expect(page).toHaveTitle('Log in | Somos Nómadas')

    await page.goto('/pt/eventos')
    await expect(page).toHaveTitle(/^[^|]+ \| Somos Nómadas$/)
  })
})

const SITIO = 'https://somosnomadas.app'

test.describe('canónica e idiomas', () => {
  const publicas = [
    ['', 'en'],
    ['/aliados/postular', 'es'],
    ['/registro', 'pt'],
    ['/iniciar-sesion', 'es'],
  ] as const

  for (const [ruta, idioma] of publicas) {
    test(`/${idioma}${ruta}: canónica a sí misma y enlaces a sus versiones en los tres idiomas`, async ({ page }) => {
      await page.goto(`/${idioma}${ruta}`)

      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITIO}/${idioma}${ruta}`)
      const versiones = await page
        .locator('link[rel="alternate"][hreflang]')
        .evaluateAll((enlaces) => Object.fromEntries(enlaces.map((e) => [e.getAttribute('hreflang'), e.getAttribute('href')])))
      expect(versiones).toEqual({
        es: `${SITIO}/es${ruta}`,
        en: `${SITIO}/en${ruta}`,
        pt: `${SITIO}/pt${ruta}`,
        'x-default': `${SITIO}/es${ruta}`,
      })
    })
  }

  for (const ruta of ['/es/confirmar-correo', '/pt/aliados', '/en/aliados/cowork-plaza', '/es/eventos']) {
    test(`${ruta} no se indexa ni declara canónica ni idiomas (privada, o con datos de ejemplo)`, async ({ page }) => {
      await page.goto(ruta)

      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
      await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0)
    })
  }
})

test.describe('mapa del sitio y robots', () => {
  test('/sitemap.xml lista las páginas públicas en los tres idiomas, enlazadas, y nada de datos de ejemplo', async ({ request }) => {
    const respuesta = await request.get('/sitemap.xml')
    expect(respuesta.status()).toBe(200)
    expect(respuesta.headers()['content-type']).toContain('xml')
    const xml = await respuesta.text()

    const direcciones = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    const rutas = ['', '/registro', '/iniciar-sesion', '/aliados/postular']
    expect(direcciones).toEqual(rutas.flatMap((ruta) => ['es', 'en', 'pt'].map((idioma) => `${SITIO}/${idioma}${ruta}`)))
    expect(xml).toContain(`<xhtml:link rel="alternate" hreflang="pt" href="${SITIO}/pt/registro" />`)
    expect(xml).toContain(`<xhtml:link rel="alternate" hreflang="x-default" href="${SITIO}/es/registro" />`)
    // Aliados y eventos son de ejemplo en estas pruebas: no se anuncian
    expect(xml).not.toContain('/aliados<')
    expect(xml).not.toContain('/eventos')
    // Ni páginas privadas
    for (const privada of ['/perfil', '/bienvenida', '/habilidades', '/confirmar-correo']) expect(xml).not.toContain(privada)
  })

  test('/robots.txt deja pasar a todos y señala el mapa', async ({ request }) => {
    const respuesta = await request.get('/robots.txt')
    expect(respuesta.status()).toBe(200)
    const texto = await respuesta.text()

    expect(texto).toContain('User-Agent: *')
    expect(texto).toContain('Allow: /')
    expect(texto).not.toContain('Disallow')
    expect(texto).toContain(`Sitemap: ${SITIO}/sitemap.xml`)
  })
})

test.describe('datos estructurados', () => {
  async function leerDatos(page: import('@playwright/test').Page) {
    const textos = await page.locator('script[type="application/ld+json"]').allTextContents()
    return textos.map((texto) => JSON.parse(texto) as { '@graph': Record<string, unknown>[] })
  }

  test('la portada dice a los buscadores quién es la organización, con su logo, y cuál es su sitio en ese idioma', async ({ page, request }) => {
    await page.goto('/pt')

    const [datos, ...otros] = await leerDatos(page)
    expect(otros).toEqual([])
    const [organizacion, sitio] = datos?.['@graph'] ?? []
    expect(organizacion).toMatchObject({
      '@type': 'Organization',
      name: 'Somos Nómadas',
      url: `${SITIO}/`,
      logo: `${SITIO}/logo/logo_isotipo.svg`,
    })
    expect(sitio).toMatchObject({ '@type': 'WebSite', url: `${SITIO}/pt`, inLanguage: 'pt' })
    // El logo que se anuncia existe de verdad
    expect((await request.get('/logo/logo_isotipo.svg')).status()).toBe(200)
  })

  test('solo la portada los lleva', async ({ page }) => {
    await page.goto('/es/registro')

    expect(await leerDatos(page)).toEqual([])
  })
})

test.describe('tarjeta al compartir', () => {
  /** Ancho y alto de un PNG, leídos de su cabecera */
  const medidasPng = (datos: Buffer) => ({ ancho: datos.readUInt32BE(16), alto: datos.readUInt32BE(20) })

  for (const idioma of ['es', 'en', 'pt'] as const) {
    test(`/${idioma}: la tarjeta trae título, descripción, idioma y una imagen PNG de 1200 × 630 que existe`, async ({ page, request }) => {
      await page.goto(`/${idioma}`)

      const propiedad = (nombre: string) => page.locator(`meta[property="${nombre}"]`)
      await expect(propiedad('og:site_name')).toHaveAttribute('content', 'Somos Nómadas')
      await expect(propiedad('og:title')).toHaveAttribute('content', 'Somos Nómadas')
      await expect(propiedad('og:type')).toHaveAttribute('content', 'website')
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image')
      const imagen = await propiedad('og:image').getAttribute('content')
      expect(imagen).toMatch(new RegExp(`^${SITIO}/${idioma}/opengraph-image`))
      // Lo que se anuncia de la imagen coincide con lo que es
      await expect(propiedad('og:image:type')).toHaveAttribute('content', 'image/png')
      await expect(propiedad('og:image:width')).toHaveAttribute('content', '1200')
      await expect(propiedad('og:image:height')).toHaveAttribute('content', '630')

      // La imagen se pide a esta web de pruebas (la dirección anunciada es la de producción)
      const respuesta = await request.get(new URL(imagen ?? '').pathname + new URL(imagen ?? '').search)
      expect(respuesta.status()).toBe(200)
      expect(respuesta.headers()['content-type']).toBe('image/png')
      const datos = await respuesta.body()
      expect(medidasPng(datos)).toEqual({ ancho: 1200, alto: 630 })
      if (idioma === 'es') writeFileSync('e2e/capturas/compartir-real-es.png', datos)
    })
  }
})
