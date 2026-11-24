// «Trayectoria»: dónde ha trabajado la persona, si lo ha hecho. Es opcional, y el «dónde» puede ser una empresa o un proyecto
// propio. Los años van con cuatro cifras; el año actual lo da quien llama, para que este archivo siga siendo puro.
// La validación es una sola y la usan el formulario (para avisar) y el servidor (que no se fía del navegador).

export const LIMITES_TRAYECTORIA = { entradas: 5, rol: 80, donde: 80, que: 160, anioMinimo: 1960 } as const

/** Una entrada ya revisada. Sin `hasta` quiere decir que sigue ahí. */
export type EntradaTrayectoria = { desde: number; hasta?: number; rol: string; donde: string; que: string }

/** Lo mismo, tal como llega del formulario: todo son textos */
export type EntradaTrayectoriaForm = { desde: string; hasta: string; rol: string; donde: string; que: string }

export type CodigoErrorTrayectoria = 'obligatorio' | 'anioInvalido' | 'anteriorAlInicio' | 'textoLargo'

export type ErroresEntradaTrayectoria = Partial<Record<'desde' | 'hasta' | 'rol' | 'donde' | 'que', CodigoErrorTrayectoria>>

/** Los errores de cada entrada, por su lugar en la lista, y el de la lista entera si hay demasiadas */
export type ErroresTrayectoria = { lista?: 'demasiadasEntradas'; entradas: Record<number, ErroresEntradaTrayectoria> }

export function hayErroresTrayectoria(errores: ErroresTrayectoria): boolean {
  return errores.lista !== undefined || Object.keys(errores.entradas).length > 0
}

/** Recorta y deja un solo espacio entre palabras */
function limpiarTexto(texto: string): string {
  return texto.trim().replace(/\s+/g, ' ')
}

function esAnio(texto: string, anioActual: number): boolean {
  if (!/^\d{4}$/.test(texto)) return false
  const anio = Number(texto)
  return anio >= LIMITES_TRAYECTORIA.anioMinimo && anio <= anioActual
}

export function validarEntradaTrayectoria(entrada: EntradaTrayectoriaForm, anioActual: number): ErroresEntradaTrayectoria {
  const errores: ErroresEntradaTrayectoria = {}

  const desde = entrada.desde.trim()
  if (desde === '') errores.desde = 'obligatorio'
  else if (!esAnio(desde, anioActual)) errores.desde = 'anioInvalido'

  const hasta = entrada.hasta.trim()
  if (hasta !== '') {
    if (!esAnio(hasta, anioActual)) errores.hasta = 'anioInvalido'
    else if (errores.desde === undefined && Number(hasta) < Number(desde)) errores.hasta = 'anteriorAlInicio'
  }

  const rol = limpiarTexto(entrada.rol)
  if (rol === '') errores.rol = 'obligatorio'
  else if (rol.length > LIMITES_TRAYECTORIA.rol) errores.rol = 'textoLargo'

  const donde = limpiarTexto(entrada.donde)
  if (donde === '') errores.donde = 'obligatorio'
  else if (donde.length > LIMITES_TRAYECTORIA.donde) errores.donde = 'textoLargo'

  // Lo que hizo ahí es opcional
  if (limpiarTexto(entrada.que).length > LIMITES_TRAYECTORIA.que) errores.que = 'textoLargo'
  return errores
}

export function validarTrayectoria(entradas: readonly EntradaTrayectoriaForm[], anioActual: number): ErroresTrayectoria {
  const errores: ErroresTrayectoria = { entradas: {} }
  if (entradas.length > LIMITES_TRAYECTORIA.entradas) errores.lista = 'demasiadasEntradas'
  entradas.forEach((entrada, lugar) => {
    const deEntrada = validarEntradaTrayectoria(entrada, anioActual)
    if (Object.keys(deEntrada).length > 0) errores.entradas[lugar] = deEntrada
  })
  return errores
}

/** Solo se llama con entradas que ya pasaron `validarTrayectoria`: las deja con números y de la más reciente a la más antigua */
export function limpiarTrayectoria(entradas: readonly EntradaTrayectoriaForm[]): EntradaTrayectoria[] {
  const limpias = entradas.map((entrada): EntradaTrayectoria => {
    const hasta = entrada.hasta.trim()
    return {
      desde: Number(entrada.desde.trim()),
      ...(hasta === '' ? {} : { hasta: Number(hasta) }),
      rol: limpiarTexto(entrada.rol),
      donde: limpiarTexto(entrada.donde),
      que: limpiarTexto(entrada.que),
    }
  })
  // Los que siguen en curso (sin `hasta`) van antes que los que terminaron el mismo año que empezaron otros
  return limpias.sort((a, b) => b.desde - a.desde || (b.hasta ?? Infinity) - (a.hasta ?? Infinity))
}
