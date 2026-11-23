type Props = {
  /** Ya con el texto en el idioma, por ejemplo "Paso 1 de 2" */
  texto: string
  actual: number
  total: number
}

// Indicador de en qué paso está la persona: el texto y una barra.
export function Progreso({ texto, actual, total }: Props) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-etiqueta-chica">{texto}</p>
      <div role="progressbar" aria-label={texto} aria-valuemin={1} aria-valuemax={total} aria-valuenow={actual} className="h-[3px] w-28 overflow-hidden rounded-full bg-texto/15">
        <div className="h-full bg-texto" style={{ width: `${(actual / total) * 100}%` }} />
      </div>
    </div>
  )
}
