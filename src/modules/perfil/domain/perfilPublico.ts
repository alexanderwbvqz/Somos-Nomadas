// Lo que otra persona ve del perfil: «Ver como me ven». Es una regla de negocio, no de pantalla: qué se enseña y qué no.
//  - Las tareas marcadas no se enseñan.
//  - De las historias, solo las que la persona aceptó mostrar (y que tienen texto).
//  - De las habilidades, solo las más fuertes.
// El resto del perfil se enseña tal cual.

import type { FichaPerfil, HabilidadPerfil, Perfil, RespuestaPerfil, TextoPerfil } from './perfil'
import type { EntradaTrayectoria } from './trayectoria'

/** Cuántas habilidades se enseñan: las más fuertes, como en la tarjeta del directorio */
export const HABILIDADES_PUBLICAS = 3

/** Lo que se muestra de un perfil, en el orden en que se lee */
export type PerfilPublico = {
  ficha: FichaPerfil
  sobreMi: string
  trayectoria: EntradaTrayectoria[]
  evidencia: string[]
  buscando: string[]
  historias: TextoPerfil[]
  sectores: RespuestaPerfil
  habilidades: HabilidadPerfil[]
  forma: RespuestaPerfil[]
  buscaPerfil: RespuestaPerfil
  socioIdeal: TextoPerfil
}

export function perfilPublico(perfil: Perfil): PerfilPublico {
  return {
    ficha: perfil.ficha,
    sobreMi: perfil.sobreMi,
    trayectoria: perfil.trayectoria,
    evidencia: perfil.evidencia,
    buscando: perfil.buscando,
    historias: perfil.historias.filter((historia) => historia.aceptaMostrar && historia.texto.trim() !== '').map(({ pregunta, texto }) => ({ pregunta, texto })),
    sectores: perfil.sectores,
    habilidades: perfil.habilidades.slice(0, HABILIDADES_PUBLICAS),
    forma: perfil.forma,
    buscaPerfil: perfil.buscaPerfil,
    socioIdeal: perfil.socioIdeal,
  }
}
