import { rmSync } from 'node:fs'
import { defineConfig } from '@playwright/test'
import { CARPETA_DE_CORREOS } from './e2e/acceso-real/correos'

// Prueba de punta a punta del acceso: el Next de verdad (compilado) hablando con el backend de verdad, con los datos
// en memoria (nada de Supabase ni de internet). Puertos propios de pruebas: ni el 3000 ni el 3100 se tocan.
const PUERTO_WEB = 3101
const PUERTO_API = 8101
const URL_API = `http://127.0.0.1:${PUERTO_API}`

// Secretos de mentira, solo para esta prueba: el backend y Next tienen que compartir el interno
const SECRETO_INTERNO = 'secreto-interno-solo-para-pruebas-e2e-0123456789'

// Los correos de la ejecución anterior se borran al empezar. Solo en el proceso principal: Playwright vuelve a cargar
// esta configuración en cada proceso de pruebas, y ahí no se puede borrar lo que ya llegó
if (process.env.TEST_WORKER_INDEX === undefined) rmSync(CARPETA_DE_CORREOS, { recursive: true, force: true })

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
        // Como en producción: sin confirmar el correo no se entra
        EXIGIR_CORREO_CONFIRMADO: 'true',
        // Los correos no se envían: cada uno queda como archivo en la carpeta, de donde los leen las pruebas
        ENVIADOR_DE_CORREOS: 'carpeta',
        CARPETA_DE_CORREOS,
        URL_WEB: `http://localhost:${PUERTO_WEB}`,
      },
      reuseExistingServer: false,
      timeout: 60000,
    },
    {
      command: `pnpm build && pnpm start -p ${PUERTO_WEB}`,
      url: `http://localhost:${PUERTO_WEB}`,
      env: {
        NEXT_DIST_DIR: '.next-pruebas',
        // Los enlaces absolutos (canónica, idiomas) como en producción: así los comprueba seo.spec.ts
        NEXT_PUBLIC_URL_SITIO: 'https://somosnomadas.app',
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
