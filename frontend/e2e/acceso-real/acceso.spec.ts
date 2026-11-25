import { expect, test, type BrowserContext, type Page } from '@playwright/test'

// Acceso de punta a punta: navegador de verdad → Next compilado → backend de verdad (datos en memoria).
// Cada grupo de pruebas navega «desde» una IP distinta (cabecera x-forwarded-for, que el servidor de Next reenvía al
// backend con el secreto interno): así los límites de intentos de uno no afectan a los demás, y de paso se comprueba
// que la IP real de la persona llega al backend.

const CLAVE = 'Clave-segura-9'
const API = 'http://127.0.0.1:8101'
const WEB = 'http://localhost:3101'
const ACCESO = '__Host-nomadas_acceso'
const RENOVACION = '__Host-nomadas_renovacion'

const correoUnico = (prefijo: string) => `${prefijo}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}@correo.com`
const desde = (ip: string) => ({ extraHTTPHeaders: { 'x-forwarded-for': ip } })

async function registrar(page: Page, correo: string, clave = CLAVE) {
  await page.goto('/es/registro')
  await page.getByLabel('Correo').fill(correo)
  await page.getByLabel('Contraseña', { exact: true }).fill(clave)
  await page.getByRole('checkbox', { name: /política de datos/ }).check()
  await page.getByRole('button', { name: 'Crear cuenta' }).click()
  await expect(page.getByRole('heading', { name: 'Te enviamos un enlace' })).toBeVisible()
}

async function entrar(page: Page, correo: string, clave = CLAVE) {
  await page.goto('/es/iniciar-sesion')
  await page.getByLabel('Correo').fill(correo)
  await page.getByLabel('Contraseña', { exact: true }).fill(clave)
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click()
}

async function cookiesDeSesion(contexto: BrowserContext) {
  const todas = await contexto.cookies()
  return {
    acceso: todas.find((c) => c.name === ACCESO),
    renovacion: todas.find((c) => c.name === RENOVACION),
  }
}

test.describe('con la clave correcta', () => {
  test.use(desde('203.0.113.10'))

  test('crear la cuenta y entrar deja la sesión en cookies httpOnly que la página no puede leer', async ({ page, context }) => {
    const correo = correoUnico('ana')
    await registrar(page, correo)
    await entrar(page, correo)

    await expect(page.getByRole('heading', { name: 'Sesión iniciada' })).toBeVisible()
    await expect(page.getByText(correo)).toBeVisible()

    const { acceso, renovacion } = await cookiesDeSesion(context)
    for (const cookie of [acceso, renovacion]) {
      expect(cookie, 'falta una cookie de sesión').toBeDefined()
      expect(cookie).toMatchObject({ httpOnly: true, secure: true, sameSite: 'Lax', path: '/' })
    }
    // El JavaScript de la página no ve ninguna: ni en document.cookie ni escritas en la propia página
    expect(await page.evaluate(() => document.cookie)).not.toContain('nomadas')
    const html = await page.content()
    expect(html).not.toContain(acceso?.value ?? 'x')
    expect(html).not.toContain(renovacion?.value ?? 'x')
  })

  test('el acceso que guarda Next vale de verdad en el backend', async ({ page, context, request }) => {
    const correo = correoUnico('luis')
    await registrar(page, correo)
    await entrar(page, correo)
    await expect(page.getByRole('heading', { name: 'Sesión iniciada' })).toBeVisible()

    const { acceso } = await cookiesDeSesion(context)
    const respuesta = await request.get(`${API}/acceso/yo`, { headers: { authorization: `Bearer ${acceso?.value ?? ''}` } })

    expect(respuesta.status()).toBe(200)
    expect((await respuesta.json()).correo).toBe(correo)
  })
})

test.describe('cuando el acceso caduca', () => {
  test.use(desde('203.0.113.20'))

  test('al volver con la renovación viva, el proxy renueva la sesión sin que la persona haga nada', async ({ page, context, request }) => {
    const correo = correoUnico('marta')
    await registrar(page, correo)
    await entrar(page, correo)
    await expect(page.getByRole('heading', { name: 'Sesión iniciada' })).toBeVisible()
    const antes = await cookiesDeSesion(context)

    // Un JWT lleva la hora en segundos: dentro del mismo segundo el nuevo saldría idéntico al viejo
    await page.waitForTimeout(1100)
    // El navegador borra la cookie del acceso cuando caduca: se hace lo mismo
    await context.clearCookies({ name: ACCESO })
    expect((await cookiesDeSesion(context)).acceso).toBeUndefined()
    await page.goto('/es/iniciar-sesion')

    const despues = await cookiesDeSesion(context)
    expect(despues.acceso, 'el proxy debía guardar un acceso nuevo').toBeDefined()
    expect(despues.acceso?.value).not.toBe(antes.acceso?.value)
    expect(despues.renovacion?.value, 'la renovación es de un solo uso: debe cambiar').not.toBe(antes.renovacion?.value)
    const yo = await request.get(`${API}/acceso/yo`, { headers: { authorization: `Bearer ${despues.acceso?.value ?? ''}` } })
    expect(yo.status()).toBe(200)
    // La renovación vieja ya no sirve
    const vieja = await request.post(`${API}/acceso/renovar`, { data: { token_renovacion: antes.renovacion?.value } })
    expect(vieja.status()).toBe(401)
  })

  test('con una renovación que el backend no reconoce, borra las cookies en vez de insistir', async ({ page, context }) => {
    await context.addCookies([
      { name: RENOVACION, value: 'renovacion-inventada-0123456789', domain: 'localhost', path: '/', httpOnly: true, secure: true, sameSite: 'Lax' },
    ])

    await page.goto('/es/iniciar-sesion')

    const { acceso, renovacion } = await cookiesDeSesion(context)
    expect(acceso).toBeUndefined()
    expect(renovacion).toBeUndefined()
  })
})

test.describe('con datos que no valen', () => {
  test.use(desde('203.0.113.30'))

  test('una contraseña incorrecta avisa sin decir cuál de los dos datos falla, y no abre sesión', async ({ page, context }) => {
    const correo = correoUnico('pedro')
    await registrar(page, correo)

    await entrar(page, correo, 'Otra-clave-1')

    await expect(page.locator('p[role=alert]')).toContainText('Correo o contraseña incorrectos')
    const { acceso, renovacion } = await cookiesDeSesion(context)
    expect(acceso).toBeUndefined()
    expect(renovacion).toBeUndefined()
  })

  test('una cuenta que no existe responde lo mismo', async ({ page }) => {
    await entrar(page, correoUnico('nadie'))

    await expect(page.locator('p[role=alert]')).toContainText('Correo o contraseña incorrectos')
  })

  test('el formulario no deja crear una cuenta con una contraseña sin símbolo', async ({ page }) => {
    await page.goto('/es/registro')
    await page.getByLabel('Correo').fill(correoUnico('sin-simbolo'))
    await page.getByLabel('Contraseña', { exact: true }).fill('Clavesegura9')
    await page.getByRole('checkbox', { name: /política de datos/ }).check()
    await page.getByRole('button', { name: 'Crear cuenta' }).click()

    await expect(page.getByText('La contraseña necesita al menos un símbolo')).toBeVisible()
  })
})

test.describe('límite de intentos', () => {
  test.use(desde('203.0.113.40'))

  test('tras 5 fallos seguidos bloquea esa combinación, y otra IP con la clave correcta entra', async ({ page, browser }) => {
    const correo = correoUnico('bloqueo')
    await registrar(page, correo)

    for (let i = 0; i < 5; i++) {
      await entrar(page, correo, 'Otra-clave-1')
      await expect(page.locator('p[role=alert]')).toContainText('Correo o contraseña incorrectos')
    }
    // Ya está bloqueado: ni la clave correcta pasa desde esa IP
    await entrar(page, correo)
    await expect(page.locator('p[role=alert]')).toContainText('demasiados intentos')

    // Desde otra IP, la misma cuenta no está bloqueada: el límite cuenta por persona, no por cuenta ni por servidor
    const otra = await browser.newContext({ baseURL: WEB, ...desde('203.0.113.41') })
    const paginaOtra = await otra.newPage()
    await entrar(paginaOtra, correo)
    await expect(paginaOtra.getByRole('heading', { name: 'Sesión iniciada' })).toBeVisible()
    await otra.close()
  })
})

test.describe('Google', () => {
  test.use(desde('203.0.113.50'))

  test('con el backend real no se ofrece entrar con Google', async ({ page }) => {
    await page.goto('/es/iniciar-sesion')
    await expect(page.getByRole('button', { name: 'Iniciar sesión', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continuar con Google' })).toHaveCount(0)

    await page.goto('/es/registro')
    await expect(page.getByRole('button', { name: 'Crear cuenta' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continuar con Google' })).toHaveCount(0)
  })
})
