import { niveles, type Nivel } from '../../domain/tarea'

type Props = {
  nivel: Nivel
  /** Ya con el texto en el idioma, por ejemplo "Nivel estimado 4 de 5" */
  texto: string
}

// El nivel del 1 al 5 como cinco puntos, llenos hasta el nivel. Se lee entero con el texto, no punto por punto.
export function NivelPuntos({ nivel, texto }: Props) {
  return (
    <span role="img" aria-label={texto} className="flex items-center gap-1.5 pt-1">
      {niveles.map((punto) => (
        <span key={punto} aria-hidden="true" data-lleno={punto <= nivel} className={`size-3.5 rounded-full border-[1.5px] border-texto ${punto <= nivel ? 'bg-texto' : ''}`} />
      ))}
    </span>
  )
}
