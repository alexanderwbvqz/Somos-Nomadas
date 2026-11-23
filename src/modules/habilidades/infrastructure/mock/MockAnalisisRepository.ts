import type { AnalisisRepository, MaterialParaAnalizar } from '../../domain/AnalisisRepository'
import type { Nivel, Sugerencia, TareaId } from '../../domain/tarea'

// simulado: no lee nada ni usa inteligencia artificial. Responde con tareas inventadas según lo que se le dé (un PDF,
// una web, un GitHub, otro enlace), tras una pequeña espera que imita lo que tardaría el análisis de verdad. Se sustituye
// por el adaptador real con el backend.
const delPdf: [TareaId, Nivel][] = [['interfacesWeb', 4], ['apiBackend', 3], ['equipo', 2]]
const deLaWeb: [TareaId, Nivel][] = [['publicarProducto', 3], ['contenido', 2]]
const delGithub: [TareaId, Nivel][] = [['apiBackend', 4], ['analizarDatos', 2]]
const deOtro: [TareaId, Nivel][] = [['campanas', 2]]

export class MockAnalisisRepository implements AnalisisRepository {
  constructor(private readonly retrasoMs = 1500) {}

  async analizar(material: MaterialParaAnalizar): Promise<Sugerencia[]> {
    if (this.retrasoMs > 0) await new Promise((resolver) => setTimeout(resolver, this.retrasoMs))

    const sugerencias: Sugerencia[] = []
    const sumar = (lista: [TareaId, Nivel][], fuente: Sugerencia['fuente']) => {
      for (const [tarea, nivel] of lista) {
        // Una tarea sale una sola vez: se queda con la que tenga más nivel
        const existente = sugerencias.find((sugerencia) => sugerencia.tarea === tarea)
        if (!existente) sugerencias.push({ tarea, nivel, fuente })
        else if (nivel > existente.nivel) Object.assign(existente, { nivel, fuente })
      }
    }

    if (material.pdf) sumar(delPdf, 'pdf')
    for (const { campo } of material.enlaces) {
      if (campo === 'web') sumar(deLaWeb, 'web')
      if (campo === 'github') sumar(delGithub, 'github')
      if (campo === 'otro') sumar(deOtro, 'otro')
    }
    return sugerencias
  }
}
