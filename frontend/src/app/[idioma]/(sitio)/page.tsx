import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LandingConectado } from '@/composition/landing/pantallas/LandingConectado'
import { esIdioma } from '@/shared/idiomas/idiomas'
import { enlacesDeIdioma } from '@/shared/seo/direcciones'

type Parametros = { params: Promise<{ idioma: string }> }

// El título y la descripción de la portada son los del sitio (layout); aquí, su canónica y sus versiones en cada idioma
export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { idioma } = await params
  if (!esIdioma(idioma)) return {}
  return { alternates: enlacesDeIdioma(idioma, '') }
}

export default async function PaginaInicio({ params }: Parametros) {
  const { idioma } = await params
  if (!esIdioma(idioma)) notFound()
  return <LandingConectado idioma={idioma} />
}
