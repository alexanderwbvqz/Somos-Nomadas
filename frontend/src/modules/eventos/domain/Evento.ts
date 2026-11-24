export type ModalidadEvento = 'presencial' | 'enlinea'

export type Evento = {
  id: string
  /** Nombre y descripción están en el idioma en que los escribe el equipo (no se traducen) */
  nombre: string
  descripcion: string
  /** Inicio en formato ISO 8601 con zona (por ejemplo 2026-12-12T23:00:00.000Z) */
  inicio: string
  /** Zona horaria del lugar, para mostrar la fecha y la hora locales */
  zonaHoraria: string
  lugar: string
  modalidad: ModalidadEvento
}
