import Image from 'next/image'

export type ElementoFranja = { nombre: string; logoSrc?: string }

type Props = {
  elementos: ElementoFranja[]
  /** Nombre accesible del grupo */
  etiqueta: string
}

function Elemento({ elemento, copia }: { elemento: ElementoFranja; copia?: boolean }) {
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

// Franja en movimiento. Sin elementos no se muestra nada.
// La lista se repite una vez (copia oculta a lectores) para que el bucle sea continuo.
export function FranjaLogos({ elementos, etiqueta }: Props) {
  if (elementos.length === 0) return null

  return (
    <div role="group" aria-label={etiqueta} className="w-full overflow-hidden">
      <ul className="franja-pista flex items-center">
        {elementos.map((elemento) => (
          <Elemento key={elemento.nombre} elemento={elemento} />
        ))}
        {elementos.map((elemento) => (
          <Elemento key={`copia-${elemento.nombre}`} elemento={elemento} copia />
        ))}
      </ul>
    </div>
  )
}
