import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { foco } from '@/shared/ui/EnlaceBoton'
import type { TextosHabilidades } from '../../language/tipos'
import type { PreguntaVista } from '../mappers/vistaForma'

type Props = {
  textos: TextosHabilidades['forma']
  preguntas: PreguntaVista[]
  /** La pregunta en la que está */
  indice: number
  respondidas: number
  alIrA: (indice: number) => void
}

// Un punto por pregunta, para ver en cuál va y saltar a otra: las anteriores en oscuro, la actual alargada y en rojo.
export function PuntosPregunta({ textos, preguntas, indice, respondidas, alIrA }: Props) {
  return (
    <ol aria-label={rellenarPlantilla(textos.resumen, { n: respondidas, total: preguntas.length })} className="flex flex-none items-center">
      {preguntas.map((pregunta, i) => (
        <li key={pregunta.id}>
          <button
            type="button"
            onClick={() => alIrA(i)}
            aria-label={rellenarPlantilla(textos.progreso, { n: i + 1, total: preguntas.length })}
            aria-current={i === indice ? 'step' : undefined}
            className={`group flex h-6 cursor-pointer items-center px-[3px] ${foco}`}
          >
            <span
              aria-hidden="true"
              className={`block h-2 rounded-full ${i === indice ? 'w-[1.375rem] bg-primario' : i < indice ? 'w-2 bg-texto' : 'w-2 bg-texto/15'}`}
            />
          </button>
        </li>
      ))}
    </ol>
  )
}
