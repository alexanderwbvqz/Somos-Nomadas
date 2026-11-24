import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { foco } from '@/shared/ui/EnlaceBoton'
import type { TextosHabilidades } from '../../language/tipos'
import type { PreguntaVista } from '../mappers/vistaForma'

type Props = {
  textos: TextosHabilidades['forma']
  preguntas: PreguntaVista[]
  respondidas: number
  alIrA: (indice: number) => void
}

// Lo ya contestado, como chips que llevan de vuelta a su pregunta; sin nada contestado no se muestra.
export function ResumenRespuestas({ textos, preguntas, respondidas, alIrA }: Props) {
  if (respondidas === 0) return null

  return (
    <div>
      <p className="text-etiqueta-chica text-texto-tenue">{rellenarPlantilla(textos.resumen, { n: respondidas, total: preguntas.length })}</p>
      <ul className="mt-2 flex flex-wrap gap-2.5">
        {preguntas.map((pregunta, indice) =>
          pregunta.respuesta ? (
            <li key={pregunta.id}>
              <button
                type="button"
                onClick={() => alIrA(indice)}
                className={`text-cuerpo cursor-pointer rounded-full border-[1.5px] border-texto bg-texto px-[1.0625rem] py-[0.5625rem] text-fondo ${foco}`}
              >
                <span className="sr-only">{pregunta.titulo} </span>
                <span aria-hidden="true">✓ </span>
                {pregunta.respuesta.titulo}
              </button>
            </li>
          ) : null,
        )}
      </ul>
    </div>
  )
}
