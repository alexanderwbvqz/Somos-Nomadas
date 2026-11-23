import { notFound } from 'next/navigation'
import { obtenerDetalleAliado } from '@/modules/aliados/application/obtenerDetalleAliado'
import { textosAliados } from '@/modules/aliados/language'
import { DetalleAliadoView } from '@/modules/aliados/presentation/DetalleAliadoView'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { crearAliadoRepository } from '../fabricas/aliados'
import { vistaDetalleAliado } from '@/modules/aliados/presentation/vistaDetalleAliado'

/** Título y descripción de la página de un aliado; undefined si el aliado no existe */
export async function metadatosDetalleAliado(idioma: Idioma, id: string) {
  const detalle = await obtenerDetalleAliado(crearAliadoRepository(), id)
  if (!detalle) return undefined
  return {
    titulo: rellenarPlantilla(textosAliados(idioma).detalle.tituloPagina, { nombre: detalle.aliado.nombre }),
    descripcion: detalle.aliado.descripcion,
  }
}

export async function DetalleAliadoConectado({ idioma, id }: { idioma: Idioma; id: string }) {
  const detalle = await obtenerDetalleAliado(crearAliadoRepository(), id)
  if (!detalle) notFound()
  return <DetalleAliadoView {...vistaDetalleAliado(detalle, idioma)} />
}
