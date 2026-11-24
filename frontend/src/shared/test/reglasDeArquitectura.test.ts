// @vitest-environment node
import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

// Corre ESLint sobre archivos imaginarios (no existen en disco) y comprueba que cada violación de las reglas de dependencia
// de CLAUDE.md falla, y que lo permitido no falla.

const eslint = new ESLint({ cwd: process.cwd() })

async function violaciones(archivo: string, codigo: string): Promise<string[]> {
  const [resultado] = await eslint.lintText(codigo, { filePath: `${process.cwd()}/${archivo}` })
  return (resultado?.messages ?? []).filter((m) => m.ruleId === 'no-restricted-imports').map((m) => m.message)
}

const prohibidos: { caso: string; archivo: string; importa: string }[] = [
  { caso: 'domain importa shared', archivo: 'src/modules/perfil/domain/imaginario.ts', importa: '@/shared/lib/formatoFechas' },
  { caso: 'domain importa composition', archivo: 'src/modules/perfil/domain/imaginario.ts', importa: '@/composition/perfil/fabricas/perfil' },
  { caso: 'domain importa su application', archivo: 'src/modules/perfil/domain/imaginario.ts', importa: '../application/obtenerPerfil' },
  { caso: 'domain importa su infrastructure', archivo: 'src/modules/perfil/domain/imaginario.ts', importa: '@/modules/perfil/infrastructure/mock/MockPerfilRepository' },
  { caso: 'domain importa la presentation de otro módulo', archivo: 'src/modules/perfil/domain/imaginario.ts', importa: '@/modules/acceso/presentation/InicioSesionView' },
  { caso: 'domain importa React', archivo: 'src/modules/perfil/domain/imaginario.ts', importa: 'react' },
  { caso: 'domain importa zod', archivo: 'src/modules/perfil/domain/imaginario.ts', importa: 'zod' },
  { caso: 'application importa infrastructure', archivo: 'src/modules/perfil/application/imaginario.ts', importa: '../infrastructure/mock/MockPerfilRepository' },
  { caso: 'application importa presentation', archivo: 'src/modules/perfil/application/imaginario.ts', importa: '@/modules/perfil/presentation/MiPerfilView' },
  { caso: 'application importa shared', archivo: 'src/modules/perfil/application/imaginario.ts', importa: '@/shared/lib/formatoFechas' },
  { caso: 'application importa React', archivo: 'src/modules/perfil/application/imaginario.ts', importa: 'react' },
  { caso: 'un test de application importa más de infrastructure que el mock', archivo: 'src/modules/perfil/application/imaginario.test.ts', importa: '../infrastructure/mappers/perfilSchema' },
  { caso: 'infrastructure importa presentation', archivo: 'src/modules/perfil/infrastructure/mock/imaginario.ts', importa: '../../presentation/MiPerfilView' },
  { caso: 'infrastructure importa presentation por alias', archivo: 'src/modules/perfil/infrastructure/mock/imaginario.ts', importa: '@/modules/perfil/presentation/MiPerfilView' },
  { caso: 'presentation importa infrastructure', archivo: 'src/modules/perfil/presentation/imaginario.ts', importa: '../infrastructure/mock/MockPerfilRepository' },
  { caso: 'presentation importa infrastructure por alias', archivo: 'src/modules/perfil/presentation/imaginario.ts', importa: '@/modules/perfil/infrastructure/mock/MockPerfilRepository' },
  { caso: 'presentation importa composition', archivo: 'src/modules/perfil/presentation/imaginario.ts', importa: '@/composition/perfil/fabricas/perfil' },
  { caso: 'un módulo importa la infrastructure de otro', archivo: 'src/modules/perfil/presentation/imaginario.ts', importa: '@/modules/acceso/infrastructure/mock/MockCuentaRepository' },
  { caso: 'un módulo importa la presentation de otro', archivo: 'src/modules/perfil/presentation/imaginario.ts', importa: '@/modules/acceso/presentation/InicioSesionView' },
  { caso: 'un módulo importa el language de otro', archivo: 'src/modules/perfil/presentation/imaginario.ts', importa: '@/modules/acceso/language/tipos' },
  { caso: 'un módulo importa la application de otro', archivo: 'src/modules/perfil/infrastructure/imaginario.ts', importa: '@/modules/acceso/application/iniciarSesion' },
  { caso: 'un archivo del módulo fuera de las capas importa composition', archivo: 'src/modules/perfil/language/imaginario.ts', importa: '@/composition/perfil/fabricas/perfil' },
  { caso: 'shared importa un módulo', archivo: 'src/shared/ui/imaginario.ts', importa: '@/modules/perfil/domain/perfil' },
  { caso: 'shared importa composition', archivo: 'src/shared/ui/imaginario.ts', importa: '@/composition/perfil/fabricas/perfil' },
  { caso: 'una relativa larga', archivo: 'src/composition/perfil/pantallas/imaginario.ts', importa: '../../../modules/perfil/domain/perfil' },
]

const permitidos: { caso: string; archivo: string; importa: string }[] = [
  { caso: 'domain importa el domain de otro módulo', archivo: 'src/modules/perfil/domain/imaginario.ts', importa: '@/modules/habilidades/domain/catalogo' },
  { caso: 'domain importa su propio domain', archivo: 'src/modules/perfil/domain/imaginario.ts', importa: './perfil' },
  { caso: 'application importa domain', archivo: 'src/modules/perfil/application/imaginario.ts', importa: '../domain/perfil' },
  { caso: 'un test de application usa el mock de su módulo', archivo: 'src/modules/perfil/application/imaginario.test.ts', importa: '../infrastructure/mock/MockPerfilRepository' },
  { caso: 'infrastructure importa domain y application', archivo: 'src/modules/perfil/infrastructure/mock/imaginario.ts', importa: '../../application/resultado' },
  { caso: 'presentation importa shared', archivo: 'src/modules/perfil/presentation/imaginario.ts', importa: '@/shared/ui/Boton' },
  { caso: 'presentation importa su language por alias', archivo: 'src/modules/perfil/presentation/imaginario.ts', importa: '@/modules/perfil/language/tipos' },
  { caso: 'presentation importa el domain de otro módulo', archivo: 'src/modules/perfil/presentation/imaginario.ts', importa: '@/modules/habilidades/domain/catalogo' },
  { caso: 'composition importa todo', archivo: 'src/composition/perfil/pantallas/imaginario.ts', importa: '@/modules/perfil/infrastructure/mock/MockPerfilRepository' },
  { caso: 'shared importa shared', archivo: 'src/shared/ui/imaginario.ts', importa: '@/shared/lib/formatoFechas' },
]

describe('reglas de dependencia (ESLint)', { timeout: 60000 }, () => {
  it.each(prohibidos)('prohíbe: $caso', async ({ archivo, importa }) => {
    expect(await violaciones(archivo, `import { x } from '${importa}'\nexport const y = x\n`)).not.toHaveLength(0)
  })

  it.each(permitidos)('permite: $caso', async ({ archivo, importa }) => {
    expect(await violaciones(archivo, `import { x } from '${importa}'\nexport const y = x\n`)).toHaveLength(0)
  })
})
