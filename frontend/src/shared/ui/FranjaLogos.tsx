import { ItemFranja } from './ItemFranja'

export type ElementoFranja = { nombre: string; logoSrc?: string }

type Props = {
  elementos: ElementoFranja[]
  /** Nombre accesible del grupo */
  etiqueta: string
}

// Franja en movimiento. Sin elementos no se muestra nada.
// La lista se repite una vez (copia oculta a lectores) para que el bucle sea continuo.
export function FranjaLogos({ elementos, etiqueta }: Props) {
  if (elementos.length === 0) return null

  return (
    <div role="group" aria-label={etiqueta} className="w-full overflow-hidden">
      <ul className="franja-pista flex items-center">
        {elementos.map((elemento) => (
          <ItemFranja key={elemento.nombre} elemento={elemento} />
        ))}
        {elementos.map((elemento) => (
          <ItemFranja key={`copia-${elemento.nombre}`} elemento={elemento} copia />
        ))}
      </ul>
    </div>
  )
}
