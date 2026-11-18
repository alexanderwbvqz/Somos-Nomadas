import Link from 'next/link'
import type { ReactNode } from 'react'

type Props = {
  href: string
  /**
   * contorno: botón con borde y flecha en círculo
   * lleno: botón oscuro con flecha en círculo claro
   * texto: enlace subrayado con flecha hacia abajo
   * enlace: enlace subrayado con flecha diagonal
   */
  variante?: 'contorno' | 'lleno' | 'texto' | 'enlace'
  children: ReactNode
}

const foco = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primario'
const subrayado = 'text-etiqueta inline-flex items-center gap-2 text-texto underline underline-offset-8'

function Flecha() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  )
}

export function EnlaceBoton({ href, variante = 'contorno', children }: Props) {
  if (variante === 'texto' || variante === 'enlace') {
    return (
      <Link href={href} className={`${subrayado} ${foco}`}>
        {children}
        <span aria-hidden="true">{variante === 'texto' ? '↓' : '↗'}</span>
      </Link>
    )
  }

  const lleno = variante === 'lleno'
  return (
    <Link
      href={href}
      className={`group text-etiqueta inline-flex items-center gap-4 rounded-full border-2 border-texto py-2 pl-6 pr-2 ${
        lleno ? 'bg-texto text-fondo hover:bg-fondo hover:text-texto' : 'text-texto hover:bg-texto hover:text-fondo'
      } ${foco}`}
    >
      {children}
      <span
        aria-hidden="true"
        className={`inline-flex size-8 items-center justify-center rounded-full ${
          lleno
            ? 'bg-fondo text-texto group-hover:bg-texto group-hover:text-fondo'
            : 'bg-texto text-fondo group-hover:bg-fondo group-hover:text-texto'
        }`}
      >
        <Flecha />
      </span>
    </Link>
  )
}
