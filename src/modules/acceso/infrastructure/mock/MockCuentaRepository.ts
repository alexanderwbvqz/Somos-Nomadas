import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { CuentaRepository } from '../../domain/CuentaRepository'
import type { CuentaNueva } from '../../domain/cuenta'

// simulado: no hay base de datos ni correos. Recuerda las cuentas en memoria mientras el servidor está encendido,
// y aun así no guarda la contraseña: solo su huella (scrypt con sal). Se sustituye por el adaptador real con el backend.
type Guardada = { nombre: string; sal: Buffer; huella: Buffer }

// Se guarda en globalThis porque en producción Next puede cargar este módulo una vez por página: sin esto, la cuenta
// creada desde "Crear cuenta" no se vería desde "Iniciar sesión". Un backend real no tiene este problema.
const global = globalThis as typeof globalThis & { __cuentasSimuladas?: Map<string, Guardada> }
const cuentas = (global.__cuentasSimuladas ??= new Map<string, Guardada>())
const SAL_FALSA = randomBytes(16)

const huellaDe = (clave: string, sal: Buffer) => scryptSync(clave, sal, 32)

export class MockCuentaRepository implements CuentaRepository {
  async registrar(cuenta: CuentaNueva): Promise<void> {
    // Un correo ya registrado no cambia nada ni lo delata
    if (cuentas.has(cuenta.correo)) return
    const sal = randomBytes(16)
    cuentas.set(cuenta.correo, { nombre: cuenta.nombre, sal, huella: huellaDe(cuenta.clave, sal) })
  }

  async iniciarSesion(correo: string, clave: string): Promise<{ nombre: string } | undefined> {
    const guardada = cuentas.get(correo)
    // Se calcula la huella aunque la cuenta no exista, para que tardar lo mismo no delate si existe
    const calculada = huellaDe(clave, guardada?.sal ?? SAL_FALSA)
    if (!guardada || !timingSafeEqual(calculada, guardada.huella)) return undefined
    return { nombre: guardada.nombre }
  }

  async reenviarConfirmacion(): Promise<void> {
    // simulado: no se manda ningún correo
  }

  /** Solo para pruebas */
  static cantidad(): number {
    return cuentas.size
  }

  /** Solo para pruebas */
  static vaciar(): void {
    cuentas.clear()
  }
}
