// Las tareas que una persona puede haber hecho, y cuánto de bien las domina. De esto sale, más adelante, qué habilidades
// tiene. Aquí solo lo necesario para mostrar y confirmar lo que se sugiere.

// inventado: catálogo mínimo para poder construir las pantallas. El catálogo de verdad se define con el paso «Qué has hecho»
export const tareas = [
  'interfacesWeb',
  'apiBackend',
  'publicarProducto',
  'analizarDatos',
  'campanas',
  'contenido',
  'ventas',
  'presupuesto',
  'operacion',
  'equipo',
] as const
export type TareaId = (typeof tareas)[number]

export const niveles = [1, 2, 3, 4, 5] as const
export type Nivel = (typeof niveles)[number]

/** De dónde sacamos la sugerencia: del PDF o de cada uno de los enlaces */
export type FuenteSugerencia = 'pdf' | 'web' | 'github' | 'otro'

export type Sugerencia = {
  tarea: TareaId
  /** Estimación: la persona puede cambiarla */
  nivel: Nivel
  fuente: FuenteSugerencia
}
