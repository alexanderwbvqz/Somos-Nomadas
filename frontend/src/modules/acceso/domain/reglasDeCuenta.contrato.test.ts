// @vitest-environment node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LIMITES_CUENTA, normalizarCorreo, validarInicioSesion, validarRegistro } from './cuenta'

// Las reglas de correo y clave están en Python y aquí. El backend exporta casos con su respuesta
// (contrato/reglas-de-cuenta.json, generado por backend/scripts/exportar_reglas_de_cuenta.py) y aquí se
// comprueba que el frontend responde lo mismo en cada uno.

type Caso = { valor: string; error: string | null }
type Reglas = {
  limites: { correo: number; parte_local: number; clave_min: number; clave_max: number }
  correos: Caso[]
  correos_normalizados: { valor: string; normalizado: string }[]
  claves: Caso[]
  claves_inicio_sesion: Caso[]
}

const reglas = JSON.parse(readFileSync(resolve(process.cwd(), '../contrato/reglas-de-cuenta.json'), 'utf-8')) as Reglas

const CODIGOS: Record<string, string> = {
  obligatorio: 'obligatorio',
  correo_invalido: 'correoInvalido',
  clave_corta: 'claveCorta',
  clave_larga: 'claveLarga',
  clave_sin_minuscula: 'claveSinMinuscula',
  clave_sin_mayuscula: 'claveSinMayuscula',
  clave_sin_numero: 'claveSinNumero',
  clave_sin_especial: 'claveSinEspecial',
}

function esperado(error: string | null): string | undefined {
  if (error === null) return undefined
  const codigo = CODIGOS[error]
  if (codigo === undefined) throw new Error(`Código del backend sin traducir: ${error}`)
  return codigo
}

const mostrar = (valor: string) => JSON.stringify(valor.length > 40 ? `${valor.slice(0, 20)}…(${valor.length})` : valor)

describe('reglas de cuenta: el frontend responde igual que el backend', () => {
  it('el archivo trae casos de sobra (si no, la prueba no vigila nada)', () => {
    expect(reglas.correos.length).toBeGreaterThanOrEqual(40)
    expect(reglas.claves.length).toBeGreaterThanOrEqual(40)
    expect(reglas.claves_inicio_sesion.length).toBeGreaterThan(5)
  })

  it('los límites son los mismos', () => {
    expect(LIMITES_CUENTA.correo).toBe(reglas.limites.correo)
    expect(LIMITES_CUENTA.parteLocal).toBe(reglas.limites.parte_local)
    expect(LIMITES_CUENTA.claveMin).toBe(reglas.limites.clave_min)
    expect(LIMITES_CUENTA.claveMax).toBe(reglas.limites.clave_max)
  })

  it.each(reglas.correos.map((c) => [mostrar(c.valor), c] as const))('correo %s', (_nombre, caso) => {
    const errores = validarInicioSesion({ correo: caso.valor, clave: 'Clave-segura1' })
    expect(errores.correo).toBe(esperado(caso.error))
    const registro = validarRegistro({ correo: caso.valor, clave: 'Clave-segura1', aceptaPolitica: true, sitioSecundario: '' })
    expect(registro.correo).toBe(esperado(caso.error))
  })

  it.each(reglas.correos_normalizados.map((c) => [mostrar(c.valor), c] as const))('normaliza %s', (_nombre, caso) => {
    expect(normalizarCorreo(caso.valor)).toBe(caso.normalizado)
  })

  it.each(reglas.claves.map((c) => [mostrar(c.valor), c] as const))('clave de registro %s', (_nombre, caso) => {
    const errores = validarRegistro({ correo: 'ana@correo.com', clave: caso.valor, aceptaPolitica: true, sitioSecundario: '' })
    expect(errores.clave).toBe(esperado(caso.error))
  })

  it.each(reglas.claves_inicio_sesion.map((c) => [mostrar(c.valor), c] as const))('clave de inicio de sesión %s', (_nombre, caso) => {
    const errores = validarInicioSesion({ correo: 'ana@correo.com', clave: caso.valor })
    expect(errores.clave).toBe(esperado(caso.error))
  })
})
