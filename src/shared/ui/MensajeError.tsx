import type { ReactNode } from 'react'

/** Mensaje de error de un campo; el icono y el texto en negrita lo distinguen sin depender solo del color */
export function MensajeError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="text-cuerpo mt-2 flex items-start gap-2 font-medium">
      <span aria-hidden="true" className="mt-0.5 inline-flex size-4 flex-none items-center justify-center rounded-full bg-primario text-etiqueta-chica leading-none text-tarjeta">
        !
      </span>
      <span>{children}</span>
    </p>
  )
}
