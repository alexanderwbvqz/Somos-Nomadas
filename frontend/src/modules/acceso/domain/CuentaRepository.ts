import type { CuentaNueva } from './cuenta'
import type { CredencialDeSesion, CuentaActual } from './sesion'

export interface CuentaRepository {
  /**
   * Crea la cuenta y manda el enlace para confirmar el correo. Si el correo ya tenía cuenta no falla ni lo dice:
   * quien lo escribió no debe poder averiguar quién está registrado.
   * Falla con `ErrorDeLimite` (demasiados intentos) o `ErrorDeCamposInvalidos` (datos que el servidor no acepta).
   */
  registrar(cuenta: CuentaNueva): Promise<void>
  /**
   * La cuenta de ese correo y contraseña, con la sesión que se abre, o undefined si no corresponden (sin decir cuál de los dos falla).
   * Falla con `ErrorDeLimite`, `ErrorDeCamposInvalidos` o `ErrorDeCorreoSinConfirmar` (la contraseña es correcta, pero
   * el correo aún no se confirmó).
   */
  iniciarSesion(correo: string, clave: string): Promise<{ correo: string; credencial: CredencialDeSesion } | undefined>
  /**
   * Entra con la identidad que Google ya verificó, creando la cuenta si es la primera vez. `credencial` es lo que
   * entrega Google al navegador; el adaptador real la valida con Google. undefined si no es válida.
   */
  iniciarConGoogle(credencial: string): Promise<{ correo: string } | undefined>
  /**
   * Cambia una `renovacion` por una credencial nueva (la anterior queda inservible), o undefined si ya no vale
   * (desconocida, caducada o ya usada). Falla con un error de red si no hay con quién hablar: eso no es rechazo.
   */
  renovarSesion(renovacion: string): Promise<CredencialDeSesion | undefined>
  /** Cierra la sesión de esa `renovacion`. No falla si ya estaba cerrada o no existe. */
  cerrarSesion(renovacion: string): Promise<void>
  /** Quién es la persona de ese `acceso`, o undefined si no vale (falso, caducado o de una sesión cerrada) */
  obtenerCuenta(acceso: string): Promise<CuentaActual | undefined>
  /** Vuelve a mandar el enlace de confirmación; no dice si el correo tiene cuenta */
  reenviarConfirmacion(correo: string): Promise<void>
}
