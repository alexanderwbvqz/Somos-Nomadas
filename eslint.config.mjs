import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  { ignores: ['.next*/**', 'node_modules/**', 'e2e/capturas/**', 'next-env.d.ts'] },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      // Sin relativas largas: usar el alias @/
      'no-restricted-imports': ['error', { patterns: [{ group: ['../../../*'], message: 'Usa el alias @/ en vez de rutas relativas largas.' }] }],
    },
  },
]
export default eslintConfig
