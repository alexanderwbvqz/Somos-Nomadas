import type { ReactNode } from 'react'
import { textosSitio } from '@/modules/sitio/language'
import { BarraEnfocada } from '@/modules/sitio/presentation/BarraEnfocada'
import type { Idioma } from '@/shared/idiomas/idiomas'

type Props = {
  idioma: Idioma
  /** Lo que va en el centro de la barra, por ejemplo el progreso */
  centro?: ReactNode
  /** Lo que va a la derecha del logo, por ejemplo «Saltar por ahora» */
  derecha?: ReactNode
}

// La barra con solo el logo de las pantallas de una sola tarea; cada pantalla dice qué lleva en el centro y a la derecha.
export function BarraEnfocadaConectado({ idioma, centro, derecha }: Props) {
  return (
    <BarraEnfocada
      logoSrc="/logo/logo_somos_nomadas_oscuro.svg"
      logoAlt={textosSitio(idioma).cabecera.logoAlt}
      hrefInicio={`/${idioma}`}
      centro={centro}
      derecha={derecha}
    />
  )
}
