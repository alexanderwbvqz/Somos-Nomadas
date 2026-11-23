import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hayAnalisis } from '@/composition/fabricas/analisis'
import { EscritasConectado } from '@/composition/pantallas/EscritasConectado'
import { textosHabilidades } from '@/modules/habilidades/language'
import { esIdioma } from '@/shared/idiomas/idiomas'

// Si no hay nada que analice lo que se sube, este camino no existe: la ruta responde como una página que no está
export const dynamic = 'force-dynamic'

type Parametros = { params: Promise<{ idioma: string }> }

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { idioma } = await params
  if (!esIdioma(idioma)) return {}
  const { metadatos } = textosHabilidades(idioma).escritas
  // Es una pantalla de dentro de la cuenta: no tiene sentido que la indexen los buscadores
  return { title: metadatos.titulo, description: metadatos.descripcion, robots: { index: false } }
}

export default async function PaginaEscritas({ params }: Parametros) {
  const { idioma } = await params
  if (!esIdioma(idioma) || !hayAnalisis()) notFound()
  return <EscritasConectado idioma={idioma} />
}
