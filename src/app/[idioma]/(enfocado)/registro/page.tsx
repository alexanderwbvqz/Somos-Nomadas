import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RegistroConectado } from '@/composition/pantallas/RegistroConectado'
import { textosAcceso } from '@/modules/acceso/language'
import { esIdioma } from '@/shared/idiomas/idiomas'

type Parametros = { params: Promise<{ idioma: string }> }

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { idioma } = await params
  if (!esIdioma(idioma)) return {}
  const { metadatos } = textosAcceso(idioma).registro
  return { title: metadatos.titulo, description: metadatos.descripcion }
}

export default async function PaginaRegistro({ params }: Parametros) {
  const { idioma } = await params
  if (!esIdioma(idioma)) notFound()
  return <RegistroConectado idioma={idioma} />
}
