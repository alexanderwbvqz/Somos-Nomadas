import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { sonAliadosDeEjemplo } from '@/composition/aliados/fabricas/aliados'
import { DetalleAliadoConectado, metadatosDetalleAliado } from '@/composition/aliados/pantallas/DetalleAliadoConectado'
import { esIdioma } from '@/shared/idiomas/idiomas'
import { enlacesDeIdioma } from '@/shared/seo/direcciones'

type Parametros = { params: Promise<{ idioma: string; id: string }> }

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { idioma, id } = await params
  if (!esIdioma(idioma)) return {}
  const metadatos = await metadatosDetalleAliado(idioma, id)
  // Solo un aliado que existe tiene metadatos: su id ya es una ruta válida
  if (!metadatos) return {}
  const textos = { title: metadatos.titulo, description: metadatos.descripcion }
  // Con aliados de ejemplo (inventados), los buscadores no la indexan
  if (sonAliadosDeEjemplo()) return { ...textos, robots: { index: false } }
  return { ...textos, alternates: enlacesDeIdioma(idioma, `/aliados/${id}`) }
}

export default async function PaginaDetalleAliado({ params }: Parametros) {
  const { idioma, id } = await params
  if (!esIdioma(idioma)) notFound()
  return await DetalleAliadoConectado({ idioma, id })
}
