// El catálogo de lo que una persona puede saber hacer: 40 habilidades, cada una con una tarea por la que se le pregunta
// («Programar una página web» para «Desarrollo web»). Se agrupan de dos maneras:
//  - en grupos con nombres neutros, solo para ordenar la lista de tareas en pantalla;
//  - en las cuatro áreas, con diez habilidades cada una, que la persona no ve hasta el resultado final.
// Los nombres de las habilidades, de las tareas y de los grupos están en los textos de cada idioma, no aquí.
// El orden de `habilidades` es el de los grupos: también decide quién va primero cuando dos empatan en fuerza.

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
  'devopsNube',
  // diseñar
  'disenoInterfaces',
  'disenoGrafico',
  'prototipado',
  'ciberseguridad',
  // datos
  'analisisDatos',
  'cienciaDatos',
  'visualizacion',
  'inteligenciaArtificial',
  // darse a conocer
  'marketingDigital',
  'contenidosRedes',
  'posicionamientoSeo',
  'comunicacionMarca',
  // vender
  'ventas',
  'desarrolloNegocio',
  'alianzas',
  'atencionCliente',
  // dinero
  'finanzasContabilidad',
  'controlGastos',
  'facturacionCobranza',
  'impuestos',
  // planear y conseguir dinero
  'modelosFinancieros',
  'levantamientoCapital',
  'creditosSubvenciones',
  'preciosMargenes',
  // poner todo en marcha
  'operacionesLogistica',
  'comprasProveedores',
  'inventario',
  'controlCalidad',
  // equipos y procesos
  'recursosHumanos',
  'legalContratos',
  'procesos',
  'nomina',
] as const
export type HabilidadId = (typeof habilidades)[number]

export const grupos = ['definir', 'construir', 'disenar', 'datos', 'darteAConocer', 'vender', 'dinero', 'planearDinero', 'ponerEnMarcha', 'equipos'] as const
export type GrupoId = (typeof grupos)[number]

export const habilidadesPorGrupo = {
  definir: ['estrategiaProducto', 'investigacionUsuarios', 'gestionProyectos', 'validacionIdeas'],
  construir: ['desarrolloWeb', 'desarrolloMovil', 'backendApis', 'devopsNube'],
  disenar: ['disenoInterfaces', 'disenoGrafico', 'prototipado', 'ciberseguridad'],
  datos: ['analisisDatos', 'cienciaDatos', 'visualizacion', 'inteligenciaArtificial'],
  darteAConocer: ['marketingDigital', 'contenidosRedes', 'posicionamientoSeo', 'comunicacionMarca'],
  vender: ['ventas', 'desarrolloNegocio', 'alianzas', 'atencionCliente'],
  dinero: ['finanzasContabilidad', 'controlGastos', 'facturacionCobranza', 'impuestos'],
  planearDinero: ['modelosFinancieros', 'levantamientoCapital', 'creditosSubvenciones', 'preciosMargenes'],
  ponerEnMarcha: ['operacionesLogistica', 'comprasProveedores', 'inventario', 'controlCalidad'],
  equipos: ['recursosHumanos', 'legalContratos', 'procesos', 'nomina'],
} as const satisfies Record<GrupoId, readonly HabilidadId[]>

export const areas = ['tecnologia', 'ventasMarketing', 'finanzas', 'operaciones'] as const
export type AreaId = (typeof areas)[number]

/** A qué área suma cada habilidad: diez a cada una, para que ninguna tenga ventaja por tener más donde acumular puntos */
export const areaDe: Record<HabilidadId, AreaId> = {
  // tecnología
  desarrolloWeb: 'tecnologia',
  desarrolloMovil: 'tecnologia',
  backendApis: 'tecnologia',
  inteligenciaArtificial: 'tecnologia',
  ciberseguridad: 'tecnologia',
  devopsNube: 'tecnologia',
  disenoInterfaces: 'tecnologia',
  prototipado: 'tecnologia',
  cienciaDatos: 'tecnologia',
  visualizacion: 'tecnologia',
  // ventas y marketing
  marketingDigital: 'ventasMarketing',
  contenidosRedes: 'ventasMarketing',
  posicionamientoSeo: 'ventasMarketing',
  comunicacionMarca: 'ventasMarketing',
  disenoGrafico: 'ventasMarketing',
  ventas: 'ventasMarketing',
  desarrolloNegocio: 'ventasMarketing',
  alianzas: 'ventasMarketing',
  validacionIdeas: 'ventasMarketing',
  investigacionUsuarios: 'ventasMarketing',
  // finanzas
  finanzasContabilidad: 'finanzas',
  levantamientoCapital: 'finanzas',
  modelosFinancieros: 'finanzas',
  analisisDatos: 'finanzas',
  controlGastos: 'finanzas',
  preciosMargenes: 'finanzas',
  facturacionCobranza: 'finanzas',
  impuestos: 'finanzas',
  creditosSubvenciones: 'finanzas',
  nomina: 'finanzas',
  // operaciones
  gestionProyectos: 'operaciones',
  estrategiaProducto: 'operaciones',
  operacionesLogistica: 'operaciones',
  legalContratos: 'operaciones',
  recursosHumanos: 'operaciones',
  atencionCliente: 'operaciones',
  comprasProveedores: 'operaciones',
  controlCalidad: 'operaciones',
  procesos: 'operaciones',
  inventario: 'operaciones',
}

export function esHabilidad(valor: unknown): valor is HabilidadId {
  return typeof valor === 'string' && (habilidades as readonly string[]).includes(valor)
}

export function esArea(valor: unknown): valor is AreaId {
  return typeof valor === 'string' && (areas as readonly string[]).includes(valor)
}
