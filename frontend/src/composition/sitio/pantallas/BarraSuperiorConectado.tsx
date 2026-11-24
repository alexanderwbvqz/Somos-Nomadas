import { textosSitio } from '@/modules/sitio/language'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { BarraSuperior } from '@/modules/sitio/presentation/BarraSuperior'

export function BarraSuperiorConectado({ idioma }: { idioma: Idioma }) {
  const t = textosSitio(idioma).cabecera
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
