// Los errores de hablar con la API. Ninguno guarda datos de la petición (ni token, ni secreto, ni correos): un error
// acaba en registros y trazas, y el texto original de un fallo de red podría llevarlos dentro.

/** La configuración del cliente es inválida (URL, secreto, ruta): es un fallo del programa, no de la red */
export class ErrorDeConfiguracionApi extends Error {
  constructor(mensaje: string) {
    super(mensaje)
    this.name = 'ErrorDeConfiguracionApi'
  }
}

export type CausaDeRed = 'sin_conexion' | 'tiempo_agotado'

/** No se pudo hablar con la API: no hubo conexión, se agotó el tiempo, o la respuesta se cortó */
export class ErrorDeRed extends Error {
  readonly causa: CausaDeRed

  constructor(causa: CausaDeRed) {
    super(`No se pudo hablar con la API (${causa})`)
    this.name = 'ErrorDeRed'
    this.causa = causa
  }
}

/** La API respondió, pero no con un éxito. `codigo` es el de la API (`credenciales_invalidas`, `limite_excedido`…) */
export class ErrorDeApi extends Error {
  readonly estado: number
  readonly codigo: string
  /** Solo en `datos_invalidos`: campo → código de error de ese campo */
  readonly campos: Readonly<Record<string, string>>
  /** Los segundos que pide esperar la API (cabecera Retry-After), si los dio */
  readonly reintentarEnSegundos: number | undefined

  constructor(
    estado: number,
    codigo: string,
    campos: Readonly<Record<string, string>> = {},
    reintentarEnSegundos?: number,
  ) {
    super(`La API respondió ${estado} (${codigo})`)
    this.name = 'ErrorDeApi'
    this.estado = estado
    this.codigo = codigo
    this.campos = campos
    this.reintentarEnSegundos = reintentarEnSegundos
  }
}
