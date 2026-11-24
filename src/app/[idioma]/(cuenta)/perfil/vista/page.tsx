import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PerfilPublicoConectado } from '@/composition/perfil/pantallas/PerfilPublicoConectado'
import { textosPerfil } from '@/modules/perfil/language'
import { esIdioma } from '@/shared/idiomas/idiomas'

// Lo que la persona escribe cambia: la página se arma en cada visita, no al compilar
export const dynamic = 'force-dynamic'

type Parametros = { params: Promise<{ idioma: string }> }

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { idioma } = await params
  if (!esIdioma(idioma)) return {}
  const { metadatos } = textosPerfil(idioma).publico
  // Es una página de dentro de la cuenta: no tiene sentido que la indexen los buscadores
  return { title: metadatos.titulo, description: metadatos.descripcion, robots: { index: false } }
}

export default async function PaginaPerfilPublico({ params }: Parametros) {
  const { idioma } = await params
  if (!esIdioma(idioma)) notFound()
  return <PerfilPublicoConectado idioma={idioma} />
}
