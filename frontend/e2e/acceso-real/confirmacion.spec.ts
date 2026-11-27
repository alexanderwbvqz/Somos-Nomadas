import { expect, test, type Browser, type Page } from '@playwright/test'
import { correosDe, esperarCorreo } from './correos'

// Confirmación del correo de punta a punta: el backend «envía» cada correo como archivo (enviador de carpeta) y exige
// el correo confirmado para entrar, como en producción. Cada grupo navega desde su propia IP (ver acceso.spec.ts).

const CLAVE = 'Clave-segura-9'
const correoUnico = (prefijo: string) => `${prefijo}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}@correo.com`
const desde = (ip: string) => ({ extraHTTPHeaders: { 'x-forwarded-for': ip } })
const ACCESO = '__Host-nomadas_acceso'
const RENOVACION = '__Host-nomadas_renovacion'
const MARCA = '__Host-nomadas_navegador'

/** Otro navegador (como el móvil), con su propia IP: no tiene la marca del que se registró */
async function otroNavegador(browser: Browser, ip: string): Promise<Page> {
  const contexto = await browser.newContext({ baseURL: 'http://localhost:3101', ...desde(ip) })
  return await contexto.newPage()
}

async function registrarEnEspanol(page: Page, correo: string) {
  await page.goto('/es/registro')
  await page.getByLabel('Correo').fill(correo)
  await page.getByLabel('Contraseña', { exact: true }).fill(CLAVE)
  await page.getByRole('checkbox', { name: /política de datos/ }).check()
  await page.getByRole('button', { name: 'Crear cuenta' }).click()
  await expect(page.getByRole('heading', { name: 'Te enviamos un enlace' })).toBeVisible()
}

async function entrar(page: Page, correo: string) {
  await page.goto('/es/iniciar-sesion')
  await page.getByLabel('Correo').fill(correo)
  await page.getByLabel('Contraseña', { exact: true }).fill(CLAVE)
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click()
}

test.describe('registrarse y confirmar en el mismo navegador', () => {
  test.use(desde('203.0.113.50'))

  test('el enlace confirma, abre la sesión y lleva directo a la bienvenida; la marca se borra', async ({ page, context }) => {
    const correo = correoUnico('directa')
    await registrarEnEspanol(page, correo)
    // Al registrarse, el navegador recibe la marca: httpOnly, invisible para la página
    const marca = (await context.cookies()).find((c) => c.name === MARCA)
    expect(marca).toMatchObject({ httpOnly: true, secure: true, sameSite: 'Lax', path: '/' })
    expect(await page.evaluate(() => document.cookie)).not.toContain('nomadas')
    const recibido = await esperarCorreo(correo)
    expect(recibido.texto).toContain('15 minutos')

    await page.goto(recibido.enlace)

    await expect(page).toHaveURL(/\/es\/bienvenida$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Tres cosas y entras' })).toBeVisible()
    const cookies = await context.cookies()
    for (const nombre of [ACCESO, RENOVACION]) {
      expect(cookies.find((c) => c.name === nombre), `falta ${nombre}`).toMatchObject({ httpOnly: true, secure: true })
    }
    expect(cookies.find((c) => c.name === MARCA)).toBeUndefined()
    // Ni la marca ni la sesión pasan por la página
    const html = await page.content()
    for (const valor of [marca?.value, ...cookies.map((c) => c.value)]) if (valor) expect(html).not.toContain(valor)
  })

  test('pedir otro enlace desde otro navegador ata el enlace nuevo a ese navegador', async ({ page, browser }) => {
    const correo = correoUnico('movil')
    await registrarEnEspanol(page, correo)
    await esperarCorreo(correo)
    const movil = await otroNavegador(browser, '203.0.113.51')
    await movil.goto('/es/confirmar-correo')
    await movil.getByLabel('Correo').fill(correo)
    await movil.getByRole('button', { name: 'Enviar enlace' }).click()
    await expect(movil.getByText(/te llegará un enlace nuevo en unos minutos/)).toBeVisible()
    const nuevo = await esperarCorreo(correo, 1)

    await movil.goto(nuevo.enlace)

    await expect(movil).toHaveURL(/\/es\/bienvenida$/)
    await movil.context().close()
  })
})

test.describe('registrarse y confirmar en otro navegador', () => {
  test.use(desde('203.0.113.60'))

  test('en portugués: llega el correo en portugués, el enlace confirma, el token sale de la barra y luego se entra', async ({ page, browser }) => {
    const correo = correoUnico('joana')
    await page.goto('/pt/registro')
    await page.getByLabel('E-mail').fill(correo)
    await page.getByLabel('Senha', { exact: true }).fill(CLAVE)
    await page.getByRole('checkbox', { name: /política de dados/ }).check()
    await page.getByRole('button', { name: 'Criar conta' }).click()
    await expect(page.getByRole('heading', { name: 'Enviamos um link' })).toBeVisible()

    const recibido = await esperarCorreo(correo)
    expect(recibido.asunto).toBe('Confirme seu e-mail no Somos Nómadas')
    expect(recibido.enlace).toMatch(/^http:\/\/localhost:3101\/pt\/confirmar-correo#token=[A-Za-z0-9_-]{43}$/)

    expect(recibido.texto).toContain('15 minutos')

    // Se abre en otro navegador: confirma, pero no abre la sesión
    const otro = await otroNavegador(browser, '203.0.113.61')
    await otro.goto(recibido.enlace)
    await expect(otro.getByRole('heading', { level: 1, name: 'E-mail confirmado' })).toBeVisible()
    // Ni en la barra ni en lo que ve la página: Next no lo vuelve a escribir al refrescar tras la acción
    expect(otro.url()).toBe('http://localhost:3101/pt/confirmar-correo')
    expect(await otro.evaluate(() => window.location.href)).toBe('http://localhost:3101/pt/confirmar-correo')
    expect((await otro.context().cookies()).map((c) => c.name)).not.toContain(ACCESO)

    await otro.getByRole('link', { name: 'Entrar' }).click()
    await expect(otro).toHaveURL(/\/pt\/iniciar-sesion$/)
    await otro.getByLabel('E-mail').fill(correo)
    await otro.getByLabel('Senha', { exact: true }).fill(CLAVE)
    await otro.getByRole('button', { name: 'Entrar', exact: true }).click()
    await expect(otro).toHaveURL(/\/pt\/bienvenida$/)
    await expect(otro.getByRole('heading', { level: 1, name: 'Três coisas e você entra' })).toBeVisible()
    await otro.context().close()
  })

  test('registrar dos veces el mismo correo muestra lo mismo y solo llega un correo', async ({ page }) => {
    const correo = correoUnico('doble')
    await registrarEnEspanol(page, correo)
    await esperarCorreo(correo)

    await registrarEnEspanol(page, correo)
    await page.waitForTimeout(1500)

    expect(correosDe(correo)).toHaveLength(1)
  })
})

test.describe('sin confirmar', () => {
  test.use(desde('203.0.113.70'))

  test('no se entra; «Enviar otro enlace» manda uno nuevo, el viejo deja de valer y el nuevo deja dentro', async ({ page }) => {
    const correo = correoUnico('pendiente')
    await registrarEnEspanol(page, correo)
    const primero = await esperarCorreo(correo)

    await entrar(page, correo)
    await expect(page.locator('p[role=alert]')).toContainText('Todavía no confirmaste tu correo')
    await page.getByRole('button', { name: 'Enviar otro enlace' }).click()
    await expect(page.getByText('Te enviamos un enlace nuevo. Revisa tu correo.')).toBeVisible()
    const segundo = await esperarCorreo(correo, 1)
    expect(segundo.enlace).not.toBe(primero.enlace)

    await page.goto(primero.enlace)
    await expect(page.getByRole('heading', { level: 1, name: 'Este enlace ya no sirve' })).toBeVisible()
    // El enlace nuevo se pidió desde este mismo navegador: confirma y deja dentro
    await page.goto(segundo.enlace)
    await expect(page).toHaveURL(/\/es\/bienvenida$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Tres cosas y entras' })).toBeVisible()
  })
})

test.describe('enlaces que no valen', () => {
  test.use(desde('203.0.113.80'))

  test('un enlace ya usado no vale, y pedir otro para una cuenta confirmada responde igual pero no envía nada', async ({ page, browser }) => {
    const correo = correoUnico('usado')
    await registrarEnEspanol(page, correo)
    const { enlace } = await esperarCorreo(correo)
    const movil = await otroNavegador(browser, '203.0.113.81')
    await movil.goto(enlace)
    await expect(movil.getByRole('heading', { level: 1, name: 'Correo confirmado' })).toBeVisible()
    // En la misma pestaña, el mismo token no se vuelve a mandar (sigue diciendo «confirmado»)
    await movil.goto(enlace)
    await expect(movil.getByRole('heading', { level: 1, name: 'Correo confirmado' })).toBeVisible()
    await movil.context().close()

    // Volver a pulsar el enlace ya usado, aunque sea en el navegador del registro: no vale ni deja dentro
    const otra = await page.context().newPage()
    await otra.goto(enlace)
    await expect(otra.getByRole('heading', { level: 1, name: 'Este enlace ya no sirve' })).toBeVisible()
    await otra.getByLabel('Correo').fill(correo)
    await otra.getByRole('button', { name: 'Enviar enlace' }).click()

    await expect(otra.getByText(/te llegará un enlace nuevo en unos minutos/)).toBeVisible()
    await page.waitForTimeout(1500)
    expect(correosDe(correo)).toHaveLength(1)
  })

  test('sin enlace, la página lo dice y deja pedir uno', async ({ page }) => {
    await page.goto('/es/confirmar-correo')

    await expect(page.getByRole('heading', { level: 1, name: 'Falta el enlace' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Enviar enlace' })).toBeVisible()
  })

  test('los buscadores no indexan la página', async ({ page }) => {
    await page.goto('/es/confirmar-correo')

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  })
})
