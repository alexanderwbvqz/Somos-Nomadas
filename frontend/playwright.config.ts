import { defineConfig } from '@playwright/test'

// Puerto propio de pruebas: el del dueño no se toca
const PUERTO = 3100

export default defineConfig({
  testDir: './e2e',
  // El acceso contra el backend de verdad tiene su propia configuración: playwright.acceso.config.ts
  testIgnore: 'acceso-real/**',
  use: { baseURL: `http://localhost:${PUERTO}` },
  webServer: {
    command: `pnpm build && pnpm start -p ${PUERTO}`,
    url: `http://localhost:${PUERTO}`,
    env: { NEXT_DIST_DIR: '.next-pruebas', NEXT_PUBLIC_USAR_MOCKS_EVENTOS: 'true', NEXT_PUBLIC_USAR_MOCKS_ALIADOS: 'true', NEXT_PUBLIC_USAR_MOCKS_ACCESO: 'true', NEXT_PUBLIC_USAR_MOCKS_FUNDADORES: 'true', NEXT_PUBLIC_USAR_MOCKS_HABILIDADES: 'true' },
    reuseExistingServer: false,
    timeout: 240000,
  },
})
