import { textosLanding } from '@/modules/landing/language'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { BarraSuperior } from '@/shared/layout/BarraSuperior'

export function BarraSuperiorConectado({ idioma }: { idioma: Idioma }) {
  const t = textosLanding(idioma).cabecera
  return (
    <BarraSuperior
      logoSrc="/logo/logo_somos_nomadas_oscuro.svg"
      logoAlt={t.logoAlt}
      hrefInicio={`/${idioma}`}
      etiquetaNavegacion={t.navegacionPrincipal}
      enlaces={[{ texto: t.postular, href: `/${idioma}/registro` }]}
    />
  )
}
