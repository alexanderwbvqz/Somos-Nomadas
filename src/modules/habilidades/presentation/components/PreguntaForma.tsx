import type { ReactNode } from 'react'
import type { PreguntaFormaId } from '../../domain/forma'
import type { TextosHabilidades } from '../../language/tipos'
import type { PreguntaVista } from '../mappers/vistaForma'

type Props = {
  textos: TextosHabilidades['forma']
  pregunta: PreguntaVista
  alElegir: (pregunta: PreguntaFormaId, opcion: string) => void
  /** Se avisa de cada clic, para pasar a la pregunta siguiente solo si fue con el ratón */
  alPulsar: (conRaton: boolean) => void
  /** Los puntos de progreso de las preguntas, a la derecha del título */
  puntos: ReactNode
}

// Una pregunta con sus opciones como tarjetas (botones de radio): el título de la pregunta recibe el foco al llegar a ella.
export function PreguntaForma({ textos, pregunta, alElegir, alPulsar, puntos }: Props) {
  return (
    <fieldset>
      <legend className="sr-only">{pregunta.titulo}</legend>
      <div className="flex items-center justify-between gap-4">
        <h2 tabIndex={-1} id="titulo-pregunta-forma" className="text-titulo-tarjeta texto-equilibrado outline-none">
          {pregunta.titulo}
        </h2>
        {puntos}
      </div>
      <div className="mt-5 grid gap-3.5 escritorio:grid-cols-3">
        {pregunta.opciones.map((opcion) => (
          <label key={opcion.id} className="relative block">
            <input
              type="radio"
              name={`forma-${pregunta.id}`}
              value={opcion.id}
              checked={opcion.elegida}
              onChange={() => alElegir(pregunta.id, opcion.id)}
              onClick={(evento) => alPulsar(evento.detail > 0)}
              className="peer sr-only"
            />
            <span className="flex h-full cursor-pointer flex-col rounded-[1.25rem] border-[1.5px] border-texto/30 bg-tarjeta p-[1.125rem] peer-checked:border-texto peer-checked:bg-texto peer-checked:text-fondo peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primario escritorio:min-h-[10.625rem]">
              <span className="text-titulo-tarjeta">{opcion.titulo}</span>
              <span className="text-cuerpo mt-2 text-texto-suave">{opcion.texto}</span>
              <span className="text-nota mt-auto pt-3.5 text-texto-tenue">{opcion.elegida ? textos.elegido : textos.elegir}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
