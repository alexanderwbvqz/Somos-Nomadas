import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { sonAliadosDeEjemplo } from '@/composition/aliados/fabricas/aliados'
import { AliadosConectado } from '@/composition/aliados/pantallas/AliadosConectado'
import { textosAliados } from '@/modules/aliados/language'
import { esIdioma } from '@/shared/idiomas/idiomas'
import { enlacesDeIdioma } from '@/shared/seo/direcciones'

type Parametros = {
  params: Promise<{ idioma: string }>
  /** ?tipo=mentores abre la página con ese filtro (los enlaces del pie y de la landing lo usan) */
  searchParams: Promise<{ tipo?: string }>
}

export async function generateMetadata({ params }: Pick<Parametros, 'params'>): Promise<Metadata> {
  const { idioma } = await params
  if (!esIdioma(idioma)) return {}
  const { metadatos } = textosAliados(idioma)
  const textos = { title: metadatos.titulo, description: metadatos.descripcion }
  // Con aliados de ejemplo (inventados), los buscadores no la indexan
  if (sonAliadosDeEjemplo()) return { ...textos, robots: { index: false } }
  return { ...textos, alternates: enlacesDeIdioma(idioma, '/aliados') }
}

export default async function PaginaAliados({ params, searchParams }: Parametros) {
  const { idioma } = await params
  const { tipo } = await searchParams
  if (!esIdioma(idioma)) notFound()
  return await AliadosConectado({ idioma, tipo })
}
