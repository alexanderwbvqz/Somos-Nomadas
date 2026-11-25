import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { CuentaRepository } from '../../domain/CuentaRepository'
import type { CuentaNueva } from '../../domain/cuenta'
import type { CredencialDeSesion, CuentaActual } from '../../domain/sesion'

// simulado: no hay base de datos, ni correos, ni Google. Recuerda las cuentas en memoria mientras el servidor
// está encendido, y aun así no guarda la contraseña: solo su huella (scrypt con sal). Se sustituye por el adaptador
// real con el backend.
type Guardada = { sal: Buffer; huella: Buffer }

// Se guarda en globalThis porque en producción Next puede cargar este módulo una vez por página: sin esto, la cuenta
// creada desde "Crear cuenta" no se vería desde "Iniciar sesión". Un backend real no tiene este problema.
const global = globalThis as typeof globalThis & { __cuentasSimuladas?: Map<string, Guardada> }
const cuentas = (global.__cuentasSimuladas ??= new Map<string, Guardada>())
// Las sesiones abiertas, por token. Igual que las cuentas, viven en globalThis para verse desde cualquier página.
type SesionSimulada = { correo: string; acceso: string }
const globalSesiones = globalThis as typeof globalThis & { __sesionesSimuladas?: Map<string, SesionSimulada> }
const sesiones = (globalSesiones.__sesionesSimuladas ??= new Map<string, SesionSimulada>()) // por token de renovación
const SEGUNDOS_DE_ACCESO = 900

function abrirSesion(correo: string): CredencialDeSesion {
  const credencial = {
    acceso: `simulado.${randomBytes(24).toString('hex')}`,
    renovacion: randomBytes(32).toString('hex'),
    expiraEnSegundos: SEGUNDOS_DE_ACCESO,
  }
  sesiones.set(credencial.renovacion, { correo, acceso: credencial.acceso })
  return credencial
}

// Los enlaces de confirmación vigentes: token → correo. Uno por cuenta; en globalThis por lo mismo que las cuentas.
const globalEnlaces = globalThis as typeof globalThis & { __enlacesSimulados?: Map<string, string> }
const enlaces = (globalEnlaces.__enlacesSimulados ??= new Map<string, string>())
let ultimoToken: string | undefined

function nuevoEnlace(correo: string): void {
  for (const [token, deQuien] of enlaces) if (deQuien === correo) enlaces.delete(token)
  ultimoToken = randomBytes(32).toString('base64url')
  enlaces.set(ultimoToken, correo)
}

const SAL_FALSA = randomBytes(16)

/** La cuenta de Google que "responde" en la simulación: cualquier credencial no vacía entra como esta persona */
export const CORREO_GOOGLE_SIMULADO = 'cuenta.google@ejemplo.com'

const huellaDe = (clave: string, sal: Buffer) => scryptSync(clave, sal, 32)

export class MockCuentaRepository implements CuentaRepository {
  async registrar(cuenta: CuentaNueva): Promise<void> {
    // Un correo ya registrado no cambia nada ni lo delata
    if (cuentas.has(cuenta.correo)) return
    const sal = randomBytes(16)
    cuentas.set(cuenta.correo, { sal, huella: huellaDe(cuenta.clave, sal) })
    // simulado: no se envía ningún correo; el enlace queda guardado (las pruebas lo leen con ultimoToken)
    nuevoEnlace(cuenta.correo)
  }

  async iniciarSesion(correo: string, clave: string): Promise<{ correo: string; credencial: CredencialDeSesion } | undefined> {
    const guardada = cuentas.get(correo)
    // Se calcula la huella aunque la cuenta no exista, para que tardar lo mismo no delate si existe
    const calculada = huellaDe(clave, guardada?.sal ?? SAL_FALSA)
    if (!guardada || !timingSafeEqual(calculada, guardada.huella)) return undefined
    return { correo, credencial: abrirSesion(correo) }
  }

  async renovarSesion(renovacion: string): Promise<CredencialDeSesion | undefined> {
    const sesion = sesiones.get(renovacion)
    if (!sesion) return undefined
    // Un solo uso: la anterior deja de valer en cuanto se entrega la nueva
    sesiones.delete(renovacion)
    return abrirSesion(sesion.correo)
  }

  async cerrarSesion(renovacion: string): Promise<void> {
    sesiones.delete(renovacion)
  }

  async obtenerCuenta(acceso: string): Promise<CuentaActual | undefined> {
    for (const sesion of sesiones.values()) {
      // La simulación no confirma correos ni tiene ids: sirven los de siempre
      if (sesion.acceso === acceso) return { id: `simulado-${sesion.correo}`, correo: sesion.correo, correoConfirmado: true }
    }
    return undefined
  }

  async iniciarConGoogle(credencial: string): Promise<{ correo: string } | undefined> {
    if (credencial.trim() === '') return undefined
    // La cuenta nace sin contraseña conocida: solo se entra con Google
    if (!cuentas.has(CORREO_GOOGLE_SIMULADO)) {
      const sal = randomBytes(16)
      cuentas.set(CORREO_GOOGLE_SIMULADO, { sal, huella: huellaDe(randomBytes(32).toString('hex'), sal) })
    }
    return { correo: CORREO_GOOGLE_SIMULADO }
  }

  async reenviarConfirmacion(correo: string): Promise<void> {
    // simulado: no se manda ningún correo. El simulado no distingue cuentas confirmadas: basta con que exista
    if (cuentas.has(correo)) nuevoEnlace(correo)
  }

  async confirmarCorreo(token: string): Promise<string | undefined> {
    const correo = enlaces.get(token)
    enlaces.delete(token)
    return correo
  }

  /** Solo para pruebas: el token del último enlace creado */
  static ultimoToken(): string | undefined {
    return ultimoToken
  }

  /** Solo para pruebas */
  static cantidad(): number {
    return cuentas.size
  }

  /** Solo para pruebas */
  static vaciar(): void {
    cuentas.clear()
    enlaces.clear()
    ultimoToken = undefined
    sesiones.clear()
  }
}
