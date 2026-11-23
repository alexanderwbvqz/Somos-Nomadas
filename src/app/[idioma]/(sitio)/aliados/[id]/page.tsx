import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DetalleAliadoConectado, metadatosDetalleAliado } from '@/composition/aliados/pantallas/DetalleAliadoConectado'
import { esIdioma } from '@/shared/idiomas/idiomas'

type Parametros = { params: Promise<{ idioma: string; id: string }> }

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { idioma, id } = await params
  if (!esIdioma(idioma)) return {}
  const metadatos = await metadatosDetalleAliado(idioma, id)
  return metadatos ? { title: metadatos.titulo, description: metadatos.descripcion } : {}
}

export default async function PaginaDetalleAliado({ params }: Parametros) {
  const { idioma, id } = await params
  if (!esIdioma(idioma)) notFound()
  return await DetalleAliadoConectado({ idioma, id })
}
