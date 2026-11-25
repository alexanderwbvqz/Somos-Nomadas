import { defineConfig } from '@playwright/test'

// Prueba de punta a punta del acceso: el Next de verdad (compilado) hablando con el backend de verdad, con los datos
// en memoria (nada de Supabase ni de internet). Puertos propios de pruebas: ni el 3000 ni el 3100 se tocan.
const PUERTO_WEB = 3101
const PUERTO_API = 8101
const URL_API = `http://127.0.0.1:${PUERTO_API}`

// Secretos de mentira, solo para esta prueba: el backend y Next tienen que compartir el interno
const SECRETO_INTERNO = 'secreto-interno-solo-para-pruebas-e2e-0123456789'

export default defineConfig({
  testDir: './e2e/acceso-real',
  // Las pruebas comparten el mismo backend (y sus límites de intentos): una detrás de otra
  workers: 1,
  use: { baseURL: `http://localhost:${PUERTO_WEB}` },
  webServer: [
    {
      command: `uv run uvicorn composition.app:crear_app --factory --app-dir src --host 127.0.0.1 --port ${PUERTO_API} --log-level warning`,
      cwd: '../backend',
      url: `${URL_API}/openapi.json`,
      env: {
        ENTORNO: 'desarrollo',
        ALMACEN_DE_DATOS: 'memoria',
        JWT_SECRETO: 'jwt-secreto-solo-para-pruebas-e2e-0123456789',
        HUELLAS_SECRETO: 'huellas-secreto-solo-para-pruebas-e2e-0123456789',
        SECRETO_INTERNO,
        EXIGIR_CORREO_CONFIRMADO: 'false',
      },
      reuseExistingServer: false,
      timeout: 60000,
    },
    {
      command: `pnpm build && pnpm start -p ${PUERTO_WEB}`,
      url: `http://localhost:${PUERTO_WEB}`,
      env: {
        NEXT_DIST_DIR: '.next-pruebas',
        NEXT_PUBLIC_USAR_MOCKS_ACCESO: 'false',
        NEXT_PUBLIC_USAR_MOCKS_EVENTOS: 'true',
        NEXT_PUBLIC_USAR_MOCKS_ALIADOS: 'true',
        NEXT_PUBLIC_USAR_MOCKS_FUNDADORES: 'true',
        NEXT_PUBLIC_USAR_MOCKS_HABILIDADES: 'true',
        URL_API,
        SECRETO_INTERNO_API: SECRETO_INTERNO,
      },
      reuseExistingServer: false,
      timeout: 240000,
    },
  ],
})
