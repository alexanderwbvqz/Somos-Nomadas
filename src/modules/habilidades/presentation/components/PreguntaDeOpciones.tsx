import type { HabilidadId } from '../../domain/catalogo'
import type { PreguntaVista } from '../mappers/vistaProfundizar'

type Props = {
  habilidad: HabilidadId
  pregunta: Extract<PreguntaVista, { tipo: 'una' | 'varias' }>
  alElegir: (habilidad: HabilidadId, pregunta: string, opcion: string) => void
}

// Una pregunta de elegir: una sola opción (botones de radio) o varias (casillas), con aspecto de botones redondeados.
export function PreguntaDeOpciones({ habilidad, pregunta, alElegir }: Props) {
  const tipoDeControl = pregunta.tipo === 'una' ? 'radio' : 'checkbox'

  return (
    <fieldset className="mt-6">
      <legend className="text-parrafo mb-2.5 font-medium">{pregunta.titulo}</legend>
      <div className="flex flex-wrap gap-2.5">
        {pregunta.opciones.map((opcion) => (
          <label key={opcion.id} className="relative">
            <input
              type={tipoDeControl}
              name={`${habilidad}-${pregunta.id}`}
              value={opcion.id}
              checked={opcion.marcada}
              onChange={() => alElegir(habilidad, pregunta.id, opcion.id)}
              className="peer sr-only"
            />
            <span className="text-cuerpo block cursor-pointer rounded-full border-[1.5px] border-texto/45 bg-tarjeta px-4 py-2.5 peer-checked:border-texto peer-checked:bg-texto peer-checked:text-fondo peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primario">
              {opcion.texto}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
