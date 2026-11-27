import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PostulacionAliadoConectado } from '@/composition/aliados/pantallas/PostulacionAliadoConectado'
import { textosAliados } from '@/modules/aliados/language'
import { esIdioma } from '@/shared/idiomas/idiomas'
import { enlacesDeIdioma } from '@/shared/seo/direcciones'

type Parametros = { params: Promise<{ idioma: string }> }

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { idioma } = await params
  if (!esIdioma(idioma)) return {}
  const { metadatos } = textosAliados(idioma).postulacion
  return { title: metadatos.titulo, description: metadatos.descripcion, alternates: enlacesDeIdioma(idioma, '/aliados/postular') }
}

export default async function PaginaPostularAliado({ params }: Parametros) {
  const { idioma } = await params
  if (!esIdioma(idioma)) notFound()
  return <PostulacionAliadoConectado idioma={idioma} />
}
