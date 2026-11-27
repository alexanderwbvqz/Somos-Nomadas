import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { notFound } from 'next/navigation'
import { ISOTIPO } from '@/composition/sitio/marca'
import { textosLanding } from '@/modules/landing/language'
import { textosSitio } from '@/modules/sitio/language'
import { ImagenCompartir } from '@/modules/sitio/presentation/ImagenCompartir'
import { esIdioma } from '@/shared/idiomas/idiomas'
import { urlDelSitio } from '@/shared/seo/direcciones'

// La imagen que acompaña a un enlace de la web al compartirlo (WhatsApp, LinkedIn, Slack…), una por idioma.
// Next la anuncia sola en `og:image` de todas las páginas del idioma.
export const alt = 'Somos Nómadas'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const FUENTES = join(process.cwd(), 'assets/fuentes')
const fuente = (archivo: string) => readFile(join(FUENTES, archivo))

export default async function ImagenParaCompartir({ params }: { params: Promise<{ idioma: string }> }) {
  const { idioma } = await params
  if (!esIdioma(idioma)) notFound()
  const { hero } = textosLanding(idioma)
  const [logo, light, lightItalic, mono, sans] = await Promise.all([
    readFile(join(process.cwd(), 'public', ISOTIPO)),
    fuente('Newsreader-Light.ttf'),
    fuente('Newsreader-LightItalic.ttf'),
    fuente('DMMono-Medium.ttf'),
    fuente('HankenGrotesk-Regular.ttf'),
  ])

  return new ImageResponse(
    <ImagenCompartir
      marca={textosSitio(idioma).marca}
      fraseInicio={hero.tituloInicio}
      fraseResaltada={hero.tituloResaltado}
      dominio={urlDelSitio(process.env.NEXT_PUBLIC_URL_SITIO).host}
      logo={`data:image/svg+xml;base64,${logo.toString('base64')}`}
    />,
    {
      ...size,
      fonts: [
        { name: 'Newsreader', data: light, weight: 300, style: 'normal' },
        { name: 'Newsreader', data: lightItalic, weight: 300, style: 'italic' },
        { name: 'DM Mono', data: mono, weight: 500, style: 'normal' },
        { name: 'Hanken Grotesk', data: sans, weight: 400, style: 'normal' },
      ],
    },
  )
}
