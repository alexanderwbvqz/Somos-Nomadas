import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import type { HabilidadId } from '../../domain/catalogo'
import { frecuencias, type Frecuencia } from '../../domain/puntos'
import type { TextosHabilidades } from '../../language/tipos'
import type { FilaTarea } from '../mappers/vistaTareas'

type Props = {
  textos: TextosHabilidades['tareas']
  fila: FilaTarea
  alAlternar: (habilidad: HabilidadId) => void
  alCambiarFrecuencia: (habilidad: HabilidadId, frecuencia: Frecuencia) => void
}

// Una tarea que se marca con una casilla; ya marcada, deja elegir cuántas veces la hizo.
export function FilaDeTarea({ textos, fila, alAlternar, alCambiarFrecuencia }: Props) {
  const marcada = fila.frecuencia !== undefined

  return (
    <li className={`rounded-2xl border-[1.5px] px-[1.125rem] py-3.5 ${marcada ? 'border-texto bg-degradado-amarillo' : 'border-texto/30 bg-tarjeta'}`}>
      <label className="text-parrafo flex cursor-pointer items-center justify-between gap-3.5">
        <span>{fila.texto}</span>
        <input
          type="checkbox"
          checked={marcada}
          onChange={() => alAlternar(fila.habilidad)}
          className="size-6 flex-none accent-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
        />
      </label>

      {marcada && (
        <fieldset className="mt-3 flex flex-wrap items-center gap-2">
          <legend className="sr-only">{rellenarPlantilla(textos.vecesDe, { tarea: fila.texto })}</legend>
          <span aria-hidden="true" className="text-nota mr-1 w-full text-texto-tenue sm:w-auto">
            {textos.cuantasVeces}
          </span>
          {frecuencias.map((frecuencia) => (
            <label key={frecuencia} className="relative">
              <input
                type="radio"
                name={`veces-${fila.habilidad}`}
                value={frecuencia}
                checked={fila.frecuencia === frecuencia}
                onChange={() => alCambiarFrecuencia(fila.habilidad, frecuencia)}
                className="peer sr-only"
              />
              <span className="text-cuerpo block cursor-pointer rounded-full border-[1.5px] border-borde-campo bg-tarjeta px-3.5 py-1.5 peer-checked:border-texto peer-checked:bg-texto peer-checked:text-fondo peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primario">
                {textos.frecuencias[frecuencia]}
              </span>
            </label>
          ))}
        </fieldset>
      )}
    </li>
  )
}
