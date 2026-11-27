import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { sonEventosDeEjemplo } from '@/composition/eventos/fabricas/eventos'
import { EventosConectado } from '@/composition/eventos/pantallas/EventosConectado'
import { textosEventos } from '@/modules/eventos/language'
import { esIdioma, idiomas } from '@/shared/idiomas/idiomas'
import { enlacesDeIdioma } from '@/shared/seo/direcciones'

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
  const textos = { title: metadatos.titulo, description: metadatos.descripcion }
  // Con eventos de ejemplo (inventados), los buscadores no la indexan
  if (sonEventosDeEjemplo()) return { ...textos, robots: { index: false } }
  return { ...textos, alternates: enlacesDeIdioma(idioma, '/eventos') }
}

export default async function PaginaEventos({ params }: Parametros) {
  const { idioma } = await params
  if (!esIdioma(idioma)) notFound()
  return await EventosConectado({ idioma })
}
