import type { ReactNode } from 'react'

type Props = {
  /** Identifica la sección; el contenido tiene id `seccion-{id}` */
  id: string
  titulo: ReactNode
  /** Algo corto a la derecha del título, por ejemplo "2 de 4" o "Lista" */
  detalle?: ReactNode
  abierta: boolean
  alAlternar: () => void
  /** Lo que se ve debajo del título cuando está cerrada, por ejemplo un resumen de lo contestado */
  resumen?: ReactNode
  children: ReactNode
}

// Una sección que se abre y se cierra pulsando su título. Quien la usa decide cuál está abierta (puede ser una sola a la vez,
// como en un acordeón, o varias). El contenido solo existe mientras está abierta.
export function SeccionPlegable({ id, titulo, detalle, abierta, alAlternar, resumen, children }: Props) {
  return (
    <section className={`overflow-hidden rounded-2xl border-[1.5px] bg-tarjeta ${abierta ? 'border-texto' : 'border-texto/30'}`}>
      <h2>
        <button
          type="button"
          aria-expanded={abierta}
          aria-controls={`seccion-${id}`}
          onClick={alAlternar}
          className={`flex w-full items-center gap-4 px-5 py-3.5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primario ${
            abierta ? 'bg-degradado-amarillo' : ''
          }`}
        >
          <span className="min-w-0 flex-1">
            <span className="block">{titulo}</span>
            {!abierta && resumen && <span className="text-nota mt-1 block text-texto-suave">{resumen}</span>}
          </span>
          {detalle && <span className="text-nota flex-none text-texto-tenue">{detalle}</span>}
          <span aria-hidden="true" className="flex size-7 flex-none items-center justify-center rounded-full border-[1.5px] border-texto leading-none">
            {abierta ? '−' : '+'}
          </span>
        </button>
      </h2>
      {abierta && (
        <div id={`seccion-${id}`} className="px-5 pb-5 pt-3">
          {children}
        </div>
      )}
    </section>
  )
}
