import type { ModalidadEvento } from '../domain/Evento'

export type TextosEventos = {
  metadatos: {
    titulo: string
    descripcion: string
  }
  hero: {
    etiqueta: string
    titulo: string
    parrafo: string
  }
  proximo: {
    etiquetaSeccion: string
    lugar: string
    hora: string
    confirmar: string
    notaConfirmar: string
    /** Lleva {evento} */
    mensajeConfirmar: string
    hoy: string
    manana: string
    /** Lleva {dias} */
    enDias: string
    modalidades: Record<ModalidadEvento, string>
    sinEventosTitulo: string
    sinEventosTexto: string
    sinEventosBoton: string
    mensajeAvisar: string
  }
  masEventos: {
    etiquetaSeccion: string
    /** Lleva {cantidad} */
    contador: string
    verMas: string
    /** Llevan {mostrados} y {total} */
    mostrando: string
  }
}
