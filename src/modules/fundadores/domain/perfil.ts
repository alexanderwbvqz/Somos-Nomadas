// Reglas del perfil de un founder. Esta es la primera parte (la bienvenida): cómo se llama, dónde está y qué busca.
// La validación es una sola y la usan el formulario (para avisar) y el servidor (que no se fía del navegador).

export const LIMITES_PERFIL = {
  nombre: 60,
  apellidos: 80,
  ciudad: 80,
  /** Cuántas cosas puede marcar en «qué estás buscando» */
  busquedasMax: 4,
} as const

/** Países que se ofrecen por ahora (solo algunos de Latam); `otro` cubre el resto */
export const paises = ['AR', 'BO', 'CL', 'CO', 'EC', 'MX', 'PY', 'PE', 'UY', 'otro'] as const
export type Pais = (typeof paises)[number]

export const busquedas = ['socioTecnico', 'socioComercial', 'alguienConIdea', 'sumarmeAIdea', 'explorando'] as const
export type Busqueda = (typeof busquedas)[number]

export type DatosBienvenida = {
  nombre: string
  apellidos: string
  /** '' mientras no se haya elegido */
  pais: Pais | ''
  /** Opcional */
  ciudad: string
  busca: Busqueda[]
}

export function datosBienvenidaVacios(): DatosBienvenida {
  return { nombre: '', apellidos: '', pais: '', ciudad: '', busca: [] }
}

export type CodigoErrorPerfil = 'obligatorio' | 'textoLargo' | 'busquedaVacia'

export type ErroresBienvenida = Partial<Record<'nombre' | 'apellidos' | 'pais' | 'ciudad' | 'busca', CodigoErrorPerfil>>

export function hayErroresPerfil(errores: object): boolean {
  return Object.keys(errores).length > 0
}

/** Recorta y deja un solo espacio entre palabras */
function limpiarTexto(texto: string): string {
  return texto.trim().replace(/\s+/g, ' ')
}

export function esPais(valor: string): valor is Pais {
  return (paises as readonly string[]).includes(valor)
}

export function validarBienvenida(datos: DatosBienvenida): ErroresBienvenida {
  const errores: ErroresBienvenida = {}

  const nombre = limpiarTexto(datos.nombre)
  if (nombre === '') errores.nombre = 'obligatorio'
  else if (nombre.length > LIMITES_PERFIL.nombre) errores.nombre = 'textoLargo'

  const apellidos = limpiarTexto(datos.apellidos)
  if (apellidos === '') errores.apellidos = 'obligatorio'
  else if (apellidos.length > LIMITES_PERFIL.apellidos) errores.apellidos = 'textoLargo'

  if (!esPais(datos.pais)) errores.pais = 'obligatorio'

  // La ciudad es opcional, pero si viene no puede pasarse del límite
  if (limpiarTexto(datos.ciudad).length > LIMITES_PERFIL.ciudad) errores.ciudad = 'textoLargo'

  if (datos.busca.length === 0) errores.busca = 'busquedaVacia'
  return errores
}

/** Lo que se guarda del perfil, ya revisado y ordenado */
export type PerfilBienvenida = {
  nombre: string
  apellidos: string
  pais: Pais
  ciudad: string
  busca: Busqueda[]
}

/** Solo se llama con datos que ya pasaron `validarBienvenida` */
export function limpiarBienvenida(datos: DatosBienvenida & { pais: Pais }): PerfilBienvenida {
  return {
    nombre: limpiarTexto(datos.nombre),
    apellidos: limpiarTexto(datos.apellidos),
    pais: datos.pais,
    ciudad: limpiarTexto(datos.ciudad),
    // Sin repetidos y en el orden de la lista, no en el que se marcó
    busca: busquedas.filter((opcion) => datos.busca.includes(opcion)),
  }
}

/** Marca o desmarca una opción respetando el tope; si ya está al tope, no añade */
export function alternarBusqueda(actuales: Busqueda[], opcion: Busqueda): Busqueda[] {
  if (actuales.includes(opcion)) return actuales.filter((actual) => actual !== opcion)
  return actuales.length >= LIMITES_PERFIL.busquedasMax ? actuales : [...actuales, opcion]
}
