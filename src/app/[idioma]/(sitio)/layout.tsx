import { notFound } from 'next/navigation'
import { BarraSuperiorConectado } from '@/composition/pantallas/BarraSuperiorConectado'
import { PieConectado } from '@/composition/pantallas/PieConectado'
import { esIdioma } from '@/shared/idiomas/idiomas'

// Páginas públicas del sitio: llevan la cabecera y el pie completos.
export default async function LayoutSitio({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ idioma: string }>
}) {
  const { idioma } = await params
  if (!esIdioma(idioma)) notFound()

  return (
    <>
      <BarraSuperiorConectado idioma={idioma} />
      <main className="flex-1">{children}</main>
      <PieConectado idioma={idioma} />
    </>
  )
}
