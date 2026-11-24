import type { ReactNode } from 'react'

type Props = {
  /** Lo de la izquierda, por ejemplo el enlace «Atrás» */
  izquierda: ReactNode
  /** Lo de la derecha, por ejemplo el botón principal */
  derecha: ReactNode
}

// La fila que cierra la tarjeta de un paso: volver a la izquierda, seguir a la derecha, separadas del contenido por una línea.
export function FilaAcciones({ izquierda, derecha }: Props) {
  return (
    <div className="mt-9 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-borde/15 pt-6">
      {izquierda}
      {derecha}
    </div>
  )
}
