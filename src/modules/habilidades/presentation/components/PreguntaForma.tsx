import type { PreguntaFormaId } from '../../domain/forma'
import type { TextosHabilidades } from '../../language/tipos'
import type { PreguntaVista } from '../mappers/vistaForma'

type Props = {
  textos: TextosHabilidades['forma']
  pregunta: PreguntaVista
  alElegir: (pregunta: PreguntaFormaId, opcion: string) => void
  /** Se avisa de cada clic, para pasar a la pregunta siguiente solo si fue con el ratón */
  alPulsar: (conRaton: boolean) => void
}

// Una pregunta con sus opciones como tarjetas (botones de radio): el título de la pregunta recibe el foco al llegar a ella.
export function PreguntaForma({ textos, pregunta, alElegir, alPulsar }: Props) {
  return (
    <fieldset>
      <legend tabIndex={-1} id="titulo-pregunta-forma" className="text-titulo-tarjeta texto-equilibrado mb-5 outline-none">
        {pregunta.titulo}
      </legend>
      <div className="grid gap-3 escritorio:grid-cols-3">
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
            <span className="flex h-full cursor-pointer flex-col gap-1.5 rounded-2xl border-[1.5px] border-texto/45 bg-tarjeta px-5 py-4 peer-checked:border-texto peer-checked:bg-suave peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primario">
              <span className="text-parrafo font-medium">{opcion.titulo}</span>
              <span className="text-cuerpo opacity-75">{opcion.texto}</span>
              <span className="text-etiqueta-chica mt-auto pt-2 font-medium">{opcion.elegida ? textos.elegido : textos.elegir}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
