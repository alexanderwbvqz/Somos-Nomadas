// La sesión de una persona que ya entró. Son secretos: viven solo en el servidor (en cookies `httpOnly`) y nunca
// se devuelven al navegador ni se escriben en un registro.

/** Lo que entrega la cuenta al abrir o renovar una sesión */
export type CredencialDeSesion = {
  /** Corta duración: es la que acompaña cada petición a una ruta privada */
  acceso: string
  /** Larga duración y de un solo uso: solo sirve para pedir una credencial nueva o para cerrar la sesión */
  renovacion: string
  /** Cuánto dura `acceso` desde que se entregó */
  expiraEnSegundos: number
}

/** Lo que hay guardado en el servidor. El acceso caduca antes: puede faltar aunque la renovación siga viva */
export type SesionGuardada = { acceso?: string; renovacion?: string }

/** Quién es la persona de una sesión abierta */
export type CuentaActual = { id: string; correo: string; correoConfirmado: boolean }

/** Dónde se guarda la sesión de quien está haciendo la petición (en la práctica, sus cookies) */
export interface AlmacenDeSesion {
  leer(): Promise<SesionGuardada>
  guardar(credencial: CredencialDeSesion): Promise<void>
  borrar(): Promise<void>
}
