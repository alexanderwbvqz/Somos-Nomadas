import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    env: { NEXT_PUBLIC_USAR_MOCKS_EVENTOS: 'true', NEXT_PUBLIC_USAR_MOCKS_ALIADOS: 'true', NEXT_PUBLIC_USAR_MOCKS_ACCESO: 'true', NEXT_PUBLIC_USAR_MOCKS_FUNDADORES: 'true', NEXT_PUBLIC_USAR_MOCKS_HABILIDADES: 'true' },
    globals: false,
    setupFiles: ['./src/shared/test/configuracion.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
