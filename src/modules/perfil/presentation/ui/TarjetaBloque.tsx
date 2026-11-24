import { useId, type ReactNode } from 'react'

type Props = {
  titulo: string
  /** Algo junto al título, por ejemplo la insignia «Opcional» */
  detalle?: ReactNode
  /** Lo de la derecha del título, por ejemplo «Editar» */
  accion?: ReactNode
  children: ReactNode
}

// Un bloque del perfil: una tarjeta blanca con su título pequeño arriba y, a la derecha, lo que se puede hacer con él.
export function TarjetaBloque({ titulo, detalle, accion, children }: Props) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="rounded-3xl bg-tarjeta px-6 py-7 escritorio:px-8">
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <h2 id={id} className="text-etiqueta-chica flex items-center gap-2.5">
          <span className="text-texto-tenue">{titulo}</span>
          {detalle}
        </h2>
        {accion}
      </div>
      {children}
    </section>
  )
}
