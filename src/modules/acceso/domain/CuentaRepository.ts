import type { CuentaNueva } from './cuenta'

export interface CuentaRepository {
  /**
   * Crea la cuenta y manda el enlace para confirmar el correo. Si el correo ya tenía cuenta no falla ni lo dice:
   * quien lo escribió no debe poder averiguar quién está registrado.
   */
  registrar(cuenta: CuentaNueva): Promise<void>
  /** La cuenta de ese correo y contraseña, o undefined si no corresponden (sin decir cuál de los dos falla) */
  iniciarSesion(correo: string, clave: string): Promise<{ correo: string } | undefined>
  /**
   * Entra con la identidad que Google ya verificó, creando la cuenta si es la primera vez. `credencial` es lo que
   * entrega Google al navegador; el adaptador real la valida con Google. undefined si no es válida.
   */
  iniciarConGoogle(credencial: string): Promise<{ correo: string } | undefined>
  /** Vuelve a mandar el enlace de confirmación; no dice si el correo tiene cuenta */
  reenviarConfirmacion(correo: string): Promise<void>
}
