import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { SeccionPlegable } from '@/shared/ui/SeccionPlegable'
import type { GrupoId, HabilidadId } from '../../domain/catalogo'
import type { Frecuencia } from '../../domain/puntos'
import type { TextosHabilidades } from '../../language/tipos'
import type { GrupoTareas } from '../mappers/vistaTareas'
import { FilaDeTarea } from './FilaDeTarea'

type Props = {
  textos: TextosHabilidades['tareas']
  grupo: GrupoTareas
  alAlternarGrupo: (grupo: GrupoId) => void
  alAlternar: (habilidad: HabilidadId) => void
  alCambiarFrecuencia: (habilidad: HabilidadId, frecuencia: Frecuencia) => void
}

// Un grupo de tareas que se abre y se cierra, con cuántas lleva marcadas.
export function GrupoDeTareas({ textos, grupo, alAlternarGrupo, alAlternar, alCambiarFrecuencia }: Props) {
  return (
    <SeccionPlegable
      id={grupo.grupo}
      titulo={<span className="text-parrafo font-medium">{grupo.titulo}</span>}
      detalle={rellenarPlantilla(textos.contadorGrupo, { n: grupo.marcadas, total: grupo.total })}
      abierta={grupo.abierto}
      alAlternar={() => alAlternarGrupo(grupo.grupo)}
    >
      <ul className="grid gap-2.5">
        {grupo.tareas.map((fila) => (
          <FilaDeTarea key={fila.habilidad} textos={textos} fila={fila} alAlternar={alAlternar} alCambiarFrecuencia={alCambiarFrecuencia} />
        ))}
      </ul>
    </SeccionPlegable>
  )
}
