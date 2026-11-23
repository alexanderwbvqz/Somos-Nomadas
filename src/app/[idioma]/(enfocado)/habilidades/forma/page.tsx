import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FormaConectado } from '@/composition/habilidades/pantallas/FormaConectado'
import { textosHabilidades } from '@/modules/habilidades/language'
import { esIdioma } from '@/shared/idiomas/idiomas'

// Lo que ya contestó la persona cambia: la página se arma en cada visita, no al compilar
export const dynamic = 'force-dynamic'

type Parametros = { params: Promise<{ idioma: string }> }

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { idioma } = await params
  if (!esIdioma(idioma)) return {}
  const { metadatos } = textosHabilidades(idioma).forma
  // Es una pantalla de dentro de la cuenta: no tiene sentido que la indexen los buscadores
  return { title: metadatos.titulo, description: metadatos.descripcion, robots: { index: false } }
}

export default async function PaginaForma({ params }: Parametros) {
  const { idioma } = await params
  if (!esIdioma(idioma)) notFound()
  return <FormaConectado idioma={idioma} />
}
