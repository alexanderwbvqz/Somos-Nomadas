import type { ReactNode } from 'react'

type Props = {
  etiqueta: string
  titulo: string
  parrafo: string
  /** Debajo del párrafo, en la columna del título (por ejemplo la lista de pasos) */
  izquierda?: ReactNode
  /** El contenido de la tarjeta de la derecha */
  children: ReactNode
}

// Maqueta común de las pantallas de acceso: título a la izquierda, tarjeta con el formulario a la derecha.
export function PaginaAcceso({ etiqueta, titulo, parrafo, izquierda, children }: Props) {
  return (
    <div className="mx-auto grid w-full max-w-7xl items-start gap-8 px-6 py-9 escritorio:grid-cols-2 escritorio:gap-[4.5rem] escritorio:px-12 escritorio:py-[4.5rem]">
      <section>
        <p className="text-etiqueta-chica">{etiqueta}</p>
        <h1 className="text-titulo texto-equilibrado mt-5">{titulo}</h1>
        <p className="text-parrafo-grande mt-5 max-w-md text-texto-suave">{parrafo}</p>
        {izquierda}
      </section>
      <div className="rounded-3xl bg-tarjeta p-6 escritorio:p-10">{children}</div>
    </div>
  )
}
