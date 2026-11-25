import { expect, test, type Page } from '@playwright/test'
import { correosDe, esperarCorreo } from './correos'

// Confirmación del correo de punta a punta: el backend «envía» cada correo como archivo (enviador de carpeta) y exige
// el correo confirmado para entrar, como en producción. Cada grupo navega desde su propia IP (ver acceso.spec.ts).

const CLAVE = 'Clave-segura-9'
const correoUnico = (prefijo: string) => `${prefijo}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}@correo.com`
const desde = (ip: string) => ({ extraHTTPHeaders: { 'x-forwarded-for': ip } })

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

test.describe('registrarse y confirmar', () => {
  test.use(desde('203.0.113.60'))

  test('en portugués: llega el correo en portugués, el enlace confirma, el token sale de la barra y luego se entra', async ({ page }) => {
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

    await page.goto(recibido.enlace)
    await expect(page.getByRole('heading', { level: 1, name: 'E-mail confirmado' })).toBeVisible()
    expect(page.url()).toBe('http://localhost:3101/pt/confirmar-correo')
    expect(page.url()).not.toContain('token')

    await page.getByRole('link', { name: 'Entrar' }).click()
    await expect(page).toHaveURL(/\/pt\/iniciar-sesion$/)
    await page.getByLabel('E-mail').fill(correo)
    await page.getByLabel('Senha', { exact: true }).fill(CLAVE)
    await page.getByRole('button', { name: 'Entrar', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Login feito' })).toBeVisible()
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

  test('no se entra; «Enviar otro enlace» manda uno nuevo, el viejo deja de valer y el nuevo confirma', async ({ page }) => {
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
    await page.goto(segundo.enlace)
    await expect(page.getByRole('heading', { level: 1, name: 'Correo confirmado' })).toBeVisible()

    await entrar(page, correo)
    await expect(page.getByRole('heading', { name: 'Sesión iniciada' })).toBeVisible()
  })
})

test.describe('enlaces que no valen', () => {
  test.use(desde('203.0.113.80'))

  test('un enlace ya usado no vale, y pedir otro para una cuenta confirmada responde igual pero no envía nada', async ({ page, context }) => {
    const correo = correoUnico('usado')
    await registrarEnEspanol(page, correo)
    const { enlace } = await esperarCorreo(correo)
    await page.goto(enlace)
    await expect(page.getByRole('heading', { level: 1, name: 'Correo confirmado' })).toBeVisible()
    // En la misma pestaña, el mismo token no se vuelve a mandar (sigue diciendo «confirmado»)
    await page.goto(enlace)
    await expect(page.getByRole('heading', { level: 1, name: 'Correo confirmado' })).toBeVisible()

    // Volver a pulsar el enlace del correo abre otra pestaña: el backend ya no lo acepta
    const otra = await context.newPage()
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
