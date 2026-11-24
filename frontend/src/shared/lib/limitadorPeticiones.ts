type Opciones = { maximo: number; ventanaMs: number }

// Limita cuántas veces puede hacer algo una misma clave (por ejemplo una dirección de red) en una ventana de tiempo.
// Vive en la memoria del servidor: sirve con una sola instancia; con varias haría falta un almacén compartido.
export function crearLimitador({ maximo, ventanaMs }: Opciones) {
  const registros = new Map<string, number[]>()

  return {
    /** true si la clave puede continuar (y lo cuenta); false si ya llegó al máximo en la ventana */
    permitir(clave: string, ahora: number = Date.now()): boolean {
      const recientes = (registros.get(clave) ?? []).filter((momento) => ahora - momento < ventanaMs)
      if (recientes.length >= maximo) {
        registros.set(clave, recientes)
        return false
      }
      registros.set(clave, [...recientes, ahora])
      return true
    },
  }
}
