// El catálogo de lo que una persona puede saber hacer: 30 habilidades, cada una con una tarea por la que se le pregunta
// («Programar una página web» para «Desarrollo web»). Se agrupan de dos maneras:
//  - en grupos con nombres neutros, solo para ordenar la lista de tareas en pantalla;
//  - en las cuatro áreas, que la persona no ve hasta el resultado final.
// Los nombres de las habilidades, de las tareas y de los grupos están en los textos de cada idioma, no aquí.

// inventado: la lista y el reparto en áreas son una primera versión; se revisan con el catálogo real

export const habilidades = [
  // definir
  'estrategiaProducto',
  'investigacionUsuarios',
  'gestionProyectos',
  'validacionIdeas',
  // construir
  'desarrolloWeb',
  'desarrolloMovil',
  'backendApis',
  'inteligenciaArtificial',
  'ciberseguridad',
  'devopsNube',
  // diseñar
  'disenoInterfaces',
  'disenoGrafico',
  'prototipado',
  // datos
  'analisisDatos',
  'cienciaDatos',
  'visualizacion',
  // darse a conocer
  'marketingDigital',
  'contenidosRedes',
  'posicionamientoSeo',
  'comunicacionMarca',
  // vender
  'ventas',
  'desarrolloNegocio',
  'atencionCliente',
  'alianzas',
  // dinero
  'finanzasContabilidad',
  'levantamientoCapital',
  'modelosFinancieros',
  // poner todo en marcha
  'operacionesLogistica',
  'legalContratos',
  'recursosHumanos',
] as const
export type HabilidadId = (typeof habilidades)[number]

export const grupos = ['definir', 'construir', 'disenar', 'datos', 'darteAConocer', 'vender', 'dinero', 'ponerEnMarcha'] as const
export type GrupoId = (typeof grupos)[number]

export const habilidadesPorGrupo = {
  definir: ['estrategiaProducto', 'investigacionUsuarios', 'gestionProyectos', 'validacionIdeas'],
  construir: ['desarrolloWeb', 'desarrolloMovil', 'backendApis', 'inteligenciaArtificial', 'ciberseguridad', 'devopsNube'],
  disenar: ['disenoInterfaces', 'disenoGrafico', 'prototipado'],
  datos: ['analisisDatos', 'cienciaDatos', 'visualizacion'],
  darteAConocer: ['marketingDigital', 'contenidosRedes', 'posicionamientoSeo', 'comunicacionMarca'],
  vender: ['ventas', 'desarrolloNegocio', 'atencionCliente', 'alianzas'],
  dinero: ['finanzasContabilidad', 'levantamientoCapital', 'modelosFinancieros'],
  ponerEnMarcha: ['operacionesLogistica', 'legalContratos', 'recursosHumanos'],
} as const satisfies Record<GrupoId, readonly HabilidadId[]>

export const areas = ['tecnologia', 'ventasMarketing', 'finanzas', 'operaciones'] as const
export type AreaId = (typeof areas)[number]

/** A qué área suma cada habilidad */
export const areaDe: Record<HabilidadId, AreaId> = {
  estrategiaProducto: 'operaciones',
  investigacionUsuarios: 'operaciones',
  gestionProyectos: 'operaciones',
  validacionIdeas: 'operaciones',
  desarrolloWeb: 'tecnologia',
  desarrolloMovil: 'tecnologia',
  backendApis: 'tecnologia',
  inteligenciaArtificial: 'tecnologia',
  ciberseguridad: 'tecnologia',
  devopsNube: 'tecnologia',
  disenoInterfaces: 'tecnologia',
  disenoGrafico: 'ventasMarketing',
  prototipado: 'tecnologia',
  analisisDatos: 'tecnologia',
  cienciaDatos: 'tecnologia',
  visualizacion: 'tecnologia',
  marketingDigital: 'ventasMarketing',
  contenidosRedes: 'ventasMarketing',
  posicionamientoSeo: 'ventasMarketing',
  comunicacionMarca: 'ventasMarketing',
  ventas: 'ventasMarketing',
  desarrolloNegocio: 'ventasMarketing',
  atencionCliente: 'ventasMarketing',
  alianzas: 'ventasMarketing',
  finanzasContabilidad: 'finanzas',
  levantamientoCapital: 'finanzas',
  modelosFinancieros: 'finanzas',
  operacionesLogistica: 'operaciones',
  legalContratos: 'operaciones',
  recursosHumanos: 'operaciones',
}

export function esHabilidad(valor: unknown): valor is HabilidadId {
  return typeof valor === 'string' && (habilidades as readonly string[]).includes(valor)
}

export function esArea(valor: unknown): valor is AreaId {
  return typeof valor === 'string' && (areas as readonly string[]).includes(valor)
}
