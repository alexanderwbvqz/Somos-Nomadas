import Image from 'next/image'
import type { ElementoFranja } from './FranjaLogos'

export function ItemFranja({ elemento, copia }: { elemento: ElementoFranja; copia?: boolean }) {
  return (
    <li className={copia ? 'franja-copia pr-16' : 'pr-16'} aria-hidden={copia ? true : undefined}>
      {elemento.logoSrc ? (
        <Image
          src={elemento.logoSrc}
          alt={copia ? '' : elemento.nombre}
          width={160}
          height={32}
          unoptimized
          className="h-8 w-auto max-w-none"
        />
      ) : (
        <span className="text-parrafo font-serif whitespace-nowrap">{elemento.nombre}</span>
      )}
    </li>
  )
}
