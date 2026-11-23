import { notFound } from 'next/navigation'
import { BarraCuentaConectado } from '@/composition/sitio/pantallas/BarraCuentaConectado'
import { esIdioma } from '@/shared/idiomas/idiomas'

// Páginas de la cuenta de la persona (perfil, descubrir, conversaciones…): llevan la barra de la cuenta y no el pie del sitio.
export default async function LayoutCuenta({
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
      <BarraCuentaConectado idioma={idioma} />
      <main className="flex-1">{children}</main>
    </>
  )
}
