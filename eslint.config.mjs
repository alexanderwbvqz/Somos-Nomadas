import { readdirSync } from 'node:fs'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

// Las reglas de dependencia de CLAUDE.md (sección 3). Un test (src/shared/test/reglasDeArquitectura.test.ts) las prueba con
// archivos imaginarios y exige que cada violación falle.
// `no-restricted-imports` de un bloque reemplaza al del anterior, así que cada bloque lleva también la regla de las relativas largas.

const relativasLargas = { group: ['../../../*'], message: 'Usa el alias @/ en vez de rutas relativas largas.' }

function restringir(patrones, paquetes = []) {
  return [
    'error',
    {
      patterns: [relativasLargas, ...patrones.map(([group, message]) => ({ group, message }))],
      paths: paquetes.map((name) => ({ name, message: 'Esta capa no puede importar este paquete.' })),
    },
  ]
}

const modulos = readdirSync('src/modules', { withFileTypes: true })
  .filter((entrada) => entrada.isDirectory())
  .map((entrada) => entrada.name)

const capasQueNoSeComparten = ['application', 'infrastructure', 'presentation', 'language']
const paquetesDeInterfaz = ['react', 'react-dom', 'next', 'zod']

// Lo que ningún archivo de un módulo puede importar: composition, y de otro módulo todo salvo su domain
function reglasComunes(modulo) {
  return [
    [['@/composition/**'], 'Un módulo no conoce composition: la composición se hace allí.'],
    ...modulos
      .filter((otro) => otro !== modulo)
      .map((otro) => [capasQueNoSeComparten.map((capa) => `@/modules/${otro}/${capa}/**`), `Un módulo solo importa el domain de otro (${otro}).`]),
  ]
}

// Lo propio de cada capa; las capas que no están aquí (language) solo llevan las reglas comunes
const reglasDeCapa = {
  domain: {
    patrones: [
      [['@/shared/**'], 'domain no importa nada de afuera.'],
      [['**/application/**', '**/infrastructure/**', '**/presentation/**', '**/language/**'], 'domain no importa de las otras capas.'],
    ],
    paquetes: paquetesDeInterfaz,
  },
  application: {
    patrones: [
      [['@/shared/**'], 'application solo importa de domain.'],
      [['**/infrastructure/**', '**/presentation/**', '**/language/**'], 'application solo importa de domain.'],
    ],
    paquetes: paquetesDeInterfaz,
  },
  infrastructure: { patrones: [[['**/presentation/**'], 'infrastructure y presentation no se importan entre sí.']], paquetes: [] },
  presentation: { patrones: [[['**/infrastructure/**'], 'infrastructure y presentation no se importan entre sí.']], paquetes: [] },
}

// Los tests de application ejercitan los casos de uso con los mocks del módulo: pueden importar infrastructure/mock, y nada más de infrastructure
const reglasDeApplicationEnTests = [
  [['@/shared/**'], 'application solo importa de domain.'],
  [['**/infrastructure/http/**', '**/infrastructure/mappers/**', '**/infrastructure/recepcion/**', '**/presentation/**', '**/language/**'], 'Los tests de application solo usan los mocks de infrastructure.'],
]

const reglasPorModulo = modulos.flatMap((modulo) => [
  { files: [`src/modules/${modulo}/**/*.{ts,tsx}`], rules: { 'no-restricted-imports': restringir(reglasComunes(modulo)) } },
  ...Object.entries(reglasDeCapa).map(([capa, { patrones, paquetes }]) => ({
    files: [`src/modules/${modulo}/${capa}/**/*.{ts,tsx}`],
    ...(capa === 'application' ? { ignores: ['**/*.test.{ts,tsx}'] } : {}),
    rules: { 'no-restricted-imports': restringir([...reglasComunes(modulo), ...patrones], paquetes) },
  })),
  {
    files: [`src/modules/${modulo}/application/**/*.test.{ts,tsx}`],
    rules: { 'no-restricted-imports': restringir([...reglasComunes(modulo), ...reglasDeApplicationEnTests], paquetesDeInterfaz) },
  },
])

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  { ignores: ['.next*/**', 'node_modules/**', 'e2e/capturas/**', 'next-env.d.ts'] },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      // Sin relativas largas: usar el alias @/
      'no-restricted-imports': restringir([]),
    },
  },
  ...reglasPorModulo,
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restringir([[['@/modules/**', '@/composition/**'], 'shared no importa de ningún módulo ni de composition.']]),
    },
  },
]
export default eslintConfig
