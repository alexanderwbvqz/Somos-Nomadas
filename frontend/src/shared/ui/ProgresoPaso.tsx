type Props = {
  /** Ya con el texto en el idioma, por ejemplo "Paso 2 de 5" */
  texto: string
  /** El nombre del paso en el que está, a la derecha */
  nombre: string
  actual: number
  total: number
}

// Progreso de los pasos, debajo de la barra de arriba: el texto y el nombre del paso, y un tramo por cada paso
// (los hechos en oscuro, el actual en rojo y los que faltan en gris).
export function ProgresoPaso({ texto, nombre, actual, total }: Props) {
  return (
    <div className="mx-auto w-full max-w-[80rem] px-6 pt-6 md:px-12 escritorio:pt-9">
      <div className="text-etiqueta-chica mb-3 flex items-start justify-between gap-4">
        <p>{texto}</p>
        <p className="text-right">{nombre}</p>
      </div>
      <div
        role="progressbar"
        aria-label={texto}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={actual}
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: total }, (_, indice) => (
          <span
            key={indice}
            data-lleno={indice < actual}
            data-actual={indice === actual - 1}
            className={`h-[5px] rounded-full ${indice < actual - 1 ? 'bg-texto' : indice === actual - 1 ? 'bg-primario' : 'bg-texto/15'}`}
          />
        ))}
      </div>
    </div>
  )
}
