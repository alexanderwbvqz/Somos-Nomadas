import type { ReactNode } from 'react'
import { textosSitio } from '@/modules/sitio/language'
import { BarraEnfocada } from '@/modules/sitio/presentation/BarraEnfocada'
import type { Idioma } from '@/shared/idiomas/idiomas'

// La barra con solo el logo de las pantallas de una sola tarea; cada pantalla dice qué lleva a la derecha.
export function BarraEnfocadaConectado({ idioma, derecha }: { idioma: Idioma; derecha?: ReactNode }) {
  return (
    <BarraEnfocada
      logoSrc="/logo/logo_somos_nomadas_oscuro.svg"
      logoAlt={textosSitio(idioma).cabecera.logoAlt}
      hrefInicio={`/${idioma}`}
      derecha={derecha}
    />
  )
}
