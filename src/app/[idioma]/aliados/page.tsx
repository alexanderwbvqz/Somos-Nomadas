import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AliadosConectado } from '@/composition/pantallas/AliadosConectado'
import { textosAliados } from '@/modules/aliados/language'
import { esIdioma, idiomas } from '@/shared/idiomas/idiomas'

type Parametros = { params: Promise<{ idioma: string }> }

export function generateStaticParams() {
  return idiomas.map((idioma) => ({ idioma }))
}

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { idioma } = await params
  if (!esIdioma(idioma)) return {}
  const { metadatos } = textosAliados(idioma)
  return { title: metadatos.titulo, description: metadatos.descripcion }
}

export default async function PaginaAliados({ params }: Parametros) {
  const { idioma } = await params
  if (!esIdioma(idioma)) notFound()
  return <AliadosConectado idioma={idioma} />
}
