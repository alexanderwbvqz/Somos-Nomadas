import type { CuentaNueva } from './cuenta'

export interface CuentaRepository {
  /**
   * Crea la cuenta y manda el enlace para confirmar el correo. Si el correo ya tenía cuenta no falla ni lo dice:
   * quien lo escribió no debe poder averiguar quién está registrado.
   */
  registrar(cuenta: CuentaNueva): Promise<void>
  /** La persona dueña de esa cuenta, o undefined si el correo o la contraseña no corresponden (sin decir cuál) */
  iniciarSesion(correo: string, clave: string): Promise<{ nombre: string } | undefined>
  /** Vuelve a mandar el enlace de confirmación; no dice si el correo tiene cuenta */
  reenviarConfirmacion(correo: string): Promise<void>
}
