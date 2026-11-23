'use client'

import { useId, useRef } from 'react'
import { CirculoFlecha, claseBoton, foco } from '@/shared/ui/EnlaceBoton'
import type { Perfil } from '../../domain/perfil'
import type { TextosPerfil } from '../../language/tipos'
import { TarjetaDirectorio } from './TarjetaDirectorio'

// «Ver como me ven»: el botón y la ventana que muestra la tarjeta del directorio. La ventana es un <dialog> nativo: atrapa el
// foco, se cierra con Escape y devuelve el foco al botón.
export function VistaPrevia({ textos, perfil }: { textos: TextosPerfil; perfil: Perfil }) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const id = useId()

  return (
    <>
      <button type="button" onClick={() => dialogo.current?.showModal()} className={claseBoton(true)}>
        {textos.verComoMeVen}
        <CirculoFlecha lleno />
      </button>
      <dialog ref={dialogo} aria-labelledby={id} className="m-auto w-[min(35rem,92vw)] rounded-[1.75rem] bg-tarjeta p-0 text-texto backdrop:bg-texto/55">
        <div className="flex items-center justify-between gap-4 pb-1 pl-[1.125rem] pr-3.5 pt-2.5">
          <h2 id={id} className="text-etiqueta-chica opacity-70">
            {textos.vistaPrevia.titulo}
          </h2>
          <button type="button" onClick={() => dialogo.current?.close()} className={`text-etiqueta-chica cursor-pointer underline underline-offset-[5px] ${foco}`}>
            {textos.vistaPrevia.cerrar}
          </button>
        </div>
        <div className="p-3.5">
          <TarjetaDirectorio perfil={perfil} textos={textos} />
          <p className="text-nota mx-2 mb-2 mt-3.5 opacity-70">{textos.vistaPrevia.nota}</p>
        </div>
      </dialog>
    </>
  )
}
