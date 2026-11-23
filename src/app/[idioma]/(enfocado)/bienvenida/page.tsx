import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BienvenidaConectado } from '@/composition/pantallas/BienvenidaConectado'
import { textosFundadores } from '@/modules/fundadores/language'
import { esIdioma } from '@/shared/idiomas/idiomas'

type Parametros = { params: Promise<{ idioma: string }> }

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { idioma } = await params
  if (!esIdioma(idioma)) return {}
  const { metadatos } = textosFundadores(idioma).bienvenida
  // Es una pantalla de dentro de la cuenta: no tiene sentido que la indexen los buscadores
  return { title: metadatos.titulo, description: metadatos.descripcion, robots: { index: false } }
}

export default async function PaginaBienvenida({ params }: Parametros) {
  const { idioma } = await params
  if (!esIdioma(idioma)) notFound()
  return <BienvenidaConectado idioma={idioma} />
}
