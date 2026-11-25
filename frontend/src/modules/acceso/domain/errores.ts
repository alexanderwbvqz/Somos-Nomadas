import type { CodigoErrorCuenta } from './cuenta'

// Lo que un repositorio de cuentas puede rechazar. Son errores del dominio: no dicen cómo se enteró el repositorio
// (una respuesta del backend, una regla del simulado…). Los casos de uso los convierten en lo que ve la persona.

/** Demasiados intentos seguidos */
export class ErrorDeLimite extends Error {
  /** Los segundos que hay que esperar, si el repositorio los sabe */
  readonly reintentarEnSegundos: number | undefined

  constructor(reintentarEnSegundos?: number) {
    super('Demasiados intentos')
    this.name = 'ErrorDeLimite'
    this.reintentarEnSegundos = reintentarEnSegundos
  }
}

/**
 * El servidor no aceptó datos que el formulario había dado por buenos (las reglas de los dos lados no coinciden, o
 * alguien se saltó el formulario). Cada campo lleva su código, ya con los nombres del dominio.
 */
export class ErrorDeCamposInvalidos extends Error {
  readonly campos: Readonly<Record<string, CodigoErrorCuenta>>

  constructor(campos: Readonly<Record<string, CodigoErrorCuenta>>) {
    super('Datos inválidos')
    this.name = 'ErrorDeCamposInvalidos'
    this.campos = campos
  }
}

/** La contraseña es correcta, pero el correo aún no se confirmó */
export class ErrorDeCorreoSinConfirmar extends Error {
  constructor() {
    super('El correo aún no se confirmó')
    this.name = 'ErrorDeCorreoSinConfirmar'
  }
}
