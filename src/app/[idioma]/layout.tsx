import type { Metadata } from 'next'
import { DM_Mono, Hanken_Grotesk, Newsreader } from 'next/font/google'
import { notFound } from 'next/navigation'
import { BarraSuperiorConectado } from '@/composition/pantallas/BarraSuperiorConectado'
import { esIdioma, idiomas } from '@/shared/idiomas/idiomas'
import '../globals.css'

// Fuentes (propuesta, parecidas a la referencia): serif para titulares, sans para texto, mono para etiquetas
const fuenteSerif = Newsreader({ subsets: ['latin'], variable: '--fuente-serif', weight: ['300', '400'], style: ['normal', 'italic'] })
const fuenteSans = Hanken_Grotesk({ subsets: ['latin'], variable: '--fuente-sans' })
const fuenteMono = DM_Mono({ subsets: ['latin'], variable: '--fuente-mono', weight: ['400', '500'] })

export const metadata: Metadata = { title: 'Nómadas' }

export function generateStaticParams() {
  return idiomas.map((idioma) => ({ idioma }))
}

export default async function LayoutIdioma({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ idioma: string }>
}) {
  const { idioma } = await params
  if (!esIdioma(idioma)) notFound()

  return (
    <html lang={idioma} className={`${fuenteSerif.variable} ${fuenteSans.variable} ${fuenteMono.variable}`}>
      <body className="flex min-h-screen flex-col">
        <BarraSuperiorConectado idioma={idioma} />
        <main className="fondo-degradado flex-1">{children}</main>
      </body>
    </html>
  )
}
