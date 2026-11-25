import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ConfirmarCorreoConectado } from '@/composition/acceso/pantallas/ConfirmarCorreoConectado'
import { textosAcceso } from '@/modules/acceso/language'
import { esIdioma } from '@/shared/idiomas/idiomas'

type Parametros = { params: Promise<{ idioma: string }> }

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { idioma } = await params
  if (!esIdioma(idioma)) return {}
  const { metadatos } = textosAcceso(idioma).confirmar
  // Es la página de un enlace personal: no tiene sentido que la indexe un buscador
  return { title: metadatos.titulo, description: metadatos.descripcion, robots: { index: false, follow: false } }
}

export default async function PaginaConfirmarCorreo({ params }: Parametros) {
  const { idioma } = await params
  if (!esIdioma(idioma)) notFound()
  return <ConfirmarCorreoConectado idioma={idioma} />
}
