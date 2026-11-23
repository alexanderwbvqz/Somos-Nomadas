import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HistoriasConectado } from '@/composition/pantallas/HistoriasConectado'
import { textosHabilidades } from '@/modules/habilidades/language'
import { esIdioma } from '@/shared/idiomas/idiomas'

// Lo que ya escribió la persona cambia: la página se arma en cada visita, no al compilar
export const dynamic = 'force-dynamic'

type Parametros = { params: Promise<{ idioma: string }> }

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { idioma } = await params
  if (!esIdioma(idioma)) return {}
  const { metadatos } = textosHabilidades(idioma).historias
  // Es una pantalla de dentro de la cuenta: no tiene sentido que la indexen los buscadores
  return { title: metadatos.titulo, description: metadatos.descripcion, robots: { index: false } }
}

export default async function PaginaHistorias({ params }: Parametros) {
  const { idioma } = await params
  if (!esIdioma(idioma)) notFound()
  return <HistoriasConectado idioma={idioma} />
}
