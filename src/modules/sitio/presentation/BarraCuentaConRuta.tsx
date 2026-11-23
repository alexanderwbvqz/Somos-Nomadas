'use client'

import { usePathname } from 'next/navigation'
import { BarraCuenta, type BarraCuentaProps } from './BarraCuenta'

type Props = Omit<BarraCuentaProps, 'enlaces' | 'perfil'> & {
  enlaces: Omit<BarraCuentaProps['enlaces'][number], 'activo'>[]
  perfil: Omit<BarraCuentaProps['perfil'], 'activo'>
}

/** Está en esa página o dentro de ella */
function estaEn(ruta: string, href: string): boolean {
  return ruta === href || ruta.startsWith(`${href}/`)
}

// La barra de la cuenta, que marca como activa la sección de la página en la que se está. Va en el layout de la cuenta, que no
// sabe en qué página está, y por eso la ruta se lee aquí.
export function BarraCuentaConRuta({ enlaces, perfil, ...resto }: Props) {
  const ruta = usePathname()
  return (
    <BarraCuenta
      {...resto}
      enlaces={enlaces.map((enlace) => ({ ...enlace, activo: enlace.href !== undefined && estaEn(ruta, enlace.href) }))}
      perfil={{ ...perfil, activo: estaEn(ruta, perfil.href) }}
    />
  )
}
