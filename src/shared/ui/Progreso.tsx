type Props = {
  /** Ya con el texto en el idioma, por ejemplo "Paso 1 de 6" */
  texto: string
  actual: number
  total: number
}

// Indicador de en qué paso está la persona: un tramo por cada paso (llenos hasta el actual) y el texto.
export function Progreso({ texto, actual, total }: Props) {
  return (
    <div className="flex items-center gap-3.5">
      <div role="progressbar" aria-label={texto} aria-valuemin={1} aria-valuemax={total} aria-valuenow={actual} className="flex gap-1.5">
        {Array.from({ length: total }, (_, indice) => (
          <span key={indice} data-lleno={indice < actual} className={`h-[3px] w-5 rounded-full escritorio:w-8 ${indice < actual ? 'bg-texto' : 'bg-texto/15'}`} />
        ))}
      </div>
      <p className="text-etiqueta-chica">{texto}</p>
    </div>
  )
}
