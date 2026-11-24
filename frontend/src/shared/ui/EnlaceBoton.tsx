import Link from 'next/link'
import type { ReactNode } from 'react'
import { CirculoFlecha } from './CirculoFlecha'

type Props = {
  href: string
  /**
   * contorno: botón con borde y flecha en círculo
   * lleno: botón oscuro con flecha en círculo claro
   * texto: enlace subrayado con flecha hacia abajo
   * enlace: enlace subrayado con flecha diagonal
   */
  variante?: 'contorno' | 'lleno' | 'texto' | 'enlace'
  /** Enlace a otro sitio: se abre en una pestaña nueva sin dar acceso a esta página */
  externo?: boolean
  children: ReactNode
}

/** Un enlace o botón de texto suelto mide al menos 24 px de alto (WCAG 2.2, 2.5.8) */
export const areaTactil = 'inline-flex min-h-6 items-center'
export const foco = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primario'
const subrayado = `text-etiqueta ${areaTactil} gap-2 text-texto underline underline-offset-8`

/** Clases del botón con borde (contorno) o relleno (lleno); las comparten enlaces y botones */
export function claseBoton(lleno: boolean): string {
  return `group text-etiqueta inline-flex items-center gap-4 rounded-full border-2 border-texto py-2 pl-6 pr-2 ${
    lleno ? 'bg-texto text-fondo hover:bg-fondo hover:text-texto' : 'text-texto hover:bg-texto hover:text-fondo'
  } ${foco}`
}

const atributosExternos = { target: '_blank', rel: 'noopener noreferrer' } as const

export function EnlaceBoton({ href, variante = 'contorno', externo = false, children }: Props) {
  const extra = externo ? atributosExternos : {}
  if (variante === 'texto' || variante === 'enlace') {
    return (
      <Link href={href} className={`${subrayado} ${foco}`} {...extra}>
        {children}
        <span aria-hidden="true">{variante === 'texto' ? '↓' : '↗'}</span>
      </Link>
    )
  }

  const lleno = variante === 'lleno'
  return (
    <Link href={href} className={claseBoton(lleno)} {...extra}>
      {children}
      <CirculoFlecha lleno={lleno} />
    </Link>
  )
}
