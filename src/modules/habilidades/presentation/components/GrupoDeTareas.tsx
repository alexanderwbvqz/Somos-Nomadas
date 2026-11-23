import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import type { GrupoId, HabilidadId } from '../../domain/catalogo'
import type { Frecuencia } from '../../domain/puntos'
import type { TextosHabilidades } from '../../language/tipos'
import type { GrupoTareas } from '../mappers/vistaTareas'
import { FilaDeTarea } from './FilaDeTarea'

type Props = {
  textos: TextosHabilidades['tareas']
  grupo: GrupoTareas
  /** Su lugar en la lista: de él depende el color de su pastilla */
  indice: number
  alAlternarGrupo: (grupo: GrupoId) => void
  alAlternar: (habilidad: HabilidadId) => void
  alCambiarFrecuencia: (habilidad: HabilidadId, frecuencia: Frecuencia) => void
}

// Los colores se reparten de tres en tres entre los grupos; solo adornan, no dicen nada del grupo
const coloresPastilla = ['bg-degradado-amarillo', 'bg-degradado-azul', 'bg-degradado-durazno'] as const

// Un grupo de tareas que se abre y se cierra, con su pastilla de color y cuántas lleva marcadas.
export function GrupoDeTareas({ textos, grupo, indice, alAlternarGrupo, alAlternar, alCambiarFrecuencia }: Props) {
  const id = `seccion-${grupo.grupo}`

  return (
    <section>
      <h2>
        <button
          type="button"
          aria-expanded={grupo.abierto}
          aria-controls={id}
          onClick={() => alAlternarGrupo(grupo.grupo)}
          className={`grid w-full cursor-pointer grid-cols-[1fr_auto_auto] items-center gap-3 rounded-[0.875rem] border-[1.5px] px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texto ${
            grupo.abierto ? 'border-texto bg-degradado-amarillo' : 'border-texto/30 bg-tarjeta'
          }`}
        >
          <span className="text-etiqueta-chica flex items-center gap-2.5">
            <span aria-hidden="true" className={`block h-2.5 w-[1.375rem] flex-none rounded ${coloresPastilla[indice % coloresPastilla.length]}`} />
            {grupo.titulo}
          </span>
          <span className="text-etiqueta-chica opacity-70">{rellenarPlantilla(textos.contadorGrupo, { n: grupo.marcadas, total: grupo.total })}</span>
          <span aria-hidden="true" className="flex size-[1.625rem] items-center justify-center rounded-full border-[1.5px] border-texto leading-none">
            {grupo.abierto ? '−' : '+'}
          </span>
        </button>
      </h2>
      {grupo.abierto && (
        <ul id={id} className="mt-3 grid gap-2.5">
          {grupo.tareas.map((fila) => (
            <FilaDeTarea key={fila.habilidad} textos={textos} fila={fila} alAlternar={alAlternar} alCambiarFrecuencia={alCambiarFrecuencia} />
          ))}
        </ul>
      )}
    </section>
  )
}
