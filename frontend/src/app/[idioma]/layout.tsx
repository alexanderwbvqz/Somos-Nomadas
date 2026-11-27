import type { Metadata } from 'next'
import { DM_Mono, Hanken_Grotesk, Newsreader } from 'next/font/google'
import { notFound } from 'next/navigation'
import { ISOTIPO } from '@/composition/sitio/marca'
import { textosSitio } from '@/modules/sitio/language'
import { metadatosDelSitio } from '@/modules/sitio/presentation/mappers/metadatosDelSitio'
import { esIdioma, idiomas } from '@/shared/idiomas/idiomas'
import { urlDelSitio } from '@/shared/seo/direcciones'
import '../globals.css'

// Fuentes (propuesta, parecidas a la referencia): serif para titulares, sans para texto, mono para etiquetas
const fuenteSerif = Newsreader({ subsets: ['latin'], variable: '--fuente-serif', weight: ['300', '400'], style: ['normal', 'italic'] })
const fuenteSans = Hanken_Grotesk({ subsets: ['latin'], variable: '--fuente-sans' })
const fuenteMono = DM_Mono({ subsets: ['latin'], variable: '--fuente-mono', weight: ['400', '500'] })

// La marca en el título de cada página, el icono de la pestaña y la dirección base de los enlaces absolutos
export async function generateMetadata({ params }: { params: Promise<{ idioma: string }> }): Promise<Metadata> {
  const { idioma } = await params
  if (!esIdioma(idioma)) return {}
  return metadatosDelSitio(textosSitio(idioma), {
    urlSitio: urlDelSitio(process.env.NEXT_PUBLIC_URL_SITIO),
    icono: ISOTIPO,
    idioma,
  })
}

export function generateStaticParams() {
  return idiomas.map((idioma) => ({ idioma }))
}

// Lo común a todas las páginas: idioma, fuentes y estilos. Lo que rodea a cada página (cabecera y pie del sitio, o solo la
// barra con el logo) lo ponen los layouts de los grupos (sitio) y (enfocado).
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
        {children}
      </body>
    </html>
  )
}
