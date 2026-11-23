import { notFound } from 'next/navigation'
import { LandingConectado } from '@/composition/pantallas/LandingConectado'
import { esIdioma } from '@/shared/idiomas/idiomas'

export default async function PaginaInicio({ params }: { params: Promise<{ idioma: string }> }) {
  const { idioma } = await params
  if (!esIdioma(idioma)) notFound()
  return <LandingConectado idioma={idioma} />
}
