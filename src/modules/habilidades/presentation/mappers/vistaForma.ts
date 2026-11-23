import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { LIMITE_SOCIO_IDEAL, preguntasForma, type CodigoErrorForma, type DatosForma, type PreguntaFormaId } from '../../domain/forma'
import type { TextosHabilidades } from '../../language/tipos'

export type OpcionVista = { id: string; titulo: string; texto: string; elegida: boolean }

export type PreguntaVista = {
  id: PreguntaFormaId
  titulo: string
  opciones: OpcionVista[]
  /** Lo que eligió, para el resumen; sin ella, todavía no contestó */
  respuesta?: { id: string; titulo: string }
}

/** Las seis preguntas como las muestra la pantalla: con los textos en el idioma y lo que ya eligió */
export function vistaForma(textos: TextosHabilidades['forma'], respuestas: DatosForma['respuestas']): PreguntaVista[] {
  return preguntasForma.map((pregunta) => {
    const elegida = respuestas[pregunta.id]
    const opciones = pregunta.opciones.map((id) => ({ id, titulo: textos.opciones[id]?.titulo ?? id, texto: textos.opciones[id]?.texto ?? '', elegida: id === elegida }))
    const marcada = opciones.find((opcion) => opcion.elegida)
    return { id: pregunta.id, titulo: textos.preguntas[pregunta.id], opciones, respuesta: marcada ? { id: marcada.id, titulo: marcada.titulo } : undefined }
  })
}

/** Por dónde empieza: la primera pregunta sin contestar; si ya están todas, el final */
export function indiceInicial(respuestas: DatosForma['respuestas']): number {
  const sinContestar = preguntasForma.findIndex((pregunta) => respuestas[pregunta.id] === undefined)
  return sinContestar === -1 ? preguntasForma.length : sinContestar
}

/** El mensaje, en el idioma de la persona, del error del texto del socio ideal; undefined si no hay */
export function mensajeDeErrorSocio(textos: TextosHabilidades['forma'], codigo: CodigoErrorForma | undefined): string | undefined {
  return codigo === 'textoLargo' ? rellenarPlantilla(textos.errores.textoLargo, { max: LIMITE_SOCIO_IDEAL }) : undefined
}
