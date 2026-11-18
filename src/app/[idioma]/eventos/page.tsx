import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { EventosConectado } from '@/composition/pantallas/EventosConectado'
import { textosEventos } from '@/modules/eventos/language'
import { esIdioma, idiomas } from '@/shared/idiomas/idiomas'

// La cuenta regresiva depende de la fecha: se regenera cada hora
export const revalidate = 3600

type Parametros = { params: Promise<{ idioma: string }> }

export function generateStaticParams() {
  return idiomas.map((idioma) => ({ idioma }))
}

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { idioma } = await params
  if (!esIdioma(idioma)) return {}
  const { metadatos } = textosEventos(idioma)
  return { title: metadatos.titulo, description: metadatos.descripcion }
}

export default async function PaginaEventos({ params }: Parametros) {
  const { idioma } = await params
  if (!esIdioma(idioma)) notFound()
  return await EventosConectado({ idioma })
}
