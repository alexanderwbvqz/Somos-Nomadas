import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { InicioSesionConectado } from '@/composition/pantallas/InicioSesionConectado'
import { textosAcceso } from '@/modules/acceso/language'
import { esIdioma } from '@/shared/idiomas/idiomas'

type Parametros = { params: Promise<{ idioma: string }> }

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { idioma } = await params
  if (!esIdioma(idioma)) return {}
  const { metadatos } = textosAcceso(idioma).inicio
  return { title: metadatos.titulo, description: metadatos.descripcion }
}

export default async function PaginaIniciarSesion({ params }: Parametros) {
  const { idioma } = await params
  if (!esIdioma(idioma)) notFound()
  return <InicioSesionConectado idioma={idioma} />
}
