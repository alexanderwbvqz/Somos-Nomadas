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
    ['/aliados', 'pt'],
    ['/aliados/postular', 'es'],
    ['/aliados/cowork-plaza', 'en'],
    ['/eventos', 'es'],
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

  test('una página privada no declara canónica ni idiomas: no se indexa', async ({ page }) => {
    await page.goto('/es/confirmar-correo')

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0)
  })
})
