import type { TextosHabilidades } from '../../language/tipos'

// Mientras el servidor lee lo que se subió. La rueda es solo adorno: lo que se anuncia es el texto.
export function Leyendo({ textos }: { textos: TextosHabilidades['escritas']['leyendo'] }) {
  return (
    <div role="status" className="mt-10 flex flex-col items-center py-6 text-center">
      <span aria-hidden="true" className="girar size-11 rounded-full border-[3px] border-texto/15 border-t-texto" />
      <p className="text-parrafo mt-6 max-w-md opacity-85">{textos.texto}</p>
    </div>
  )
}
