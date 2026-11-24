import { EnlaceBoton } from '@/shared/ui/EnlaceBoton'
import type { TextosPostulacion } from '@/modules/aliados/language/tipos'

type Props = {
  textos: TextosPostulacion['confirmacion']
  hrefVolver: string
}

// Lo que se ve cuando la postulación ya se envió: qué pasa ahora y cuáles son los estados por los que pasará.
export function ConfirmacionPostulacion({ textos, hrefVolver }: Props) {
  return (
    <div className="px-2 py-6 text-center">
      <span aria-hidden="true" className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-texto text-3xl text-fondo">
        ✓
      </span>
      <h2 id="titulo-confirmacion" tabIndex={-1} className="text-titulo-seccion outline-none">
        {textos.titulo}
      </h2>
      <p className="text-parrafo mx-auto mt-3 max-w-md opacity-80">{textos.texto}</p>
      <ol className="text-etiqueta-chica mt-6 flex flex-wrap justify-center gap-2.5">
        <li aria-current="step" className="rounded-full border-[1.5px] border-texto bg-degradado-amarillo px-3.5 py-1.5">
          {textos.estados.pendiente}
        </li>
        <li className="rounded-full border-[1.5px] border-dashed border-texto/50 px-3.5 py-1.5">{textos.estados.aprobada}</li>
        <li className="rounded-full border-[1.5px] border-dashed border-texto/50 px-3.5 py-1.5">{textos.estados.publicada}</li>
      </ol>
      <p className="text-cuerpo mx-auto mt-6 max-w-md opacity-80">{textos.nota}</p>
      <div className="mt-7 flex justify-center">
        <EnlaceBoton href={hrefVolver}>{textos.volver}</EnlaceBoton>
      </div>
    </div>
  )
}
