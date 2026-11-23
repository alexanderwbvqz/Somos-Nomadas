import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { Badge } from '@/shared/ui/Badge'
import { Boton } from '@/shared/ui/Boton'
import { foco } from '@/shared/ui/EnlaceBoton'
import type { Sugerencia, TareaId } from '../../domain/tarea'
import type { TextosHabilidades } from '../../language/tipos'
import { vistaSugerencias } from '../mappers/vistaSugerencias'
import { NivelPuntos } from '../ui/NivelPuntos'

type Props = {
  textos: TextosHabilidades['escritas']
  sugerencias: Sugerencia[]
  confirmadas: TareaId[]
  alAlternar: (tarea: TareaId) => void
  alConfirmar: () => void
  alVolver: () => void
}

// Lo que se entendió del material: cada tarea con su fuente y su nivel estimado, para confirmarla o quitarla.
export function Revision({ textos, sugerencias, confirmadas, alAlternar, alConfirmar, alVolver }: Props) {
  const t = textos.revision
  const filas = vistaSugerencias(sugerencias, textos)
  const botonVolver = (
    <button type="button" onClick={alVolver} className={`text-parrafo underline underline-offset-4 ${foco}`}>
      {t.volver}
    </button>
  )

  if (filas.length === 0) {
    return (
      <div className="mt-8">
        <p className="text-parrafo rounded-xl bg-suave px-4 py-3">{t.vacio}</p>
        <div className="mt-6">{botonVolver}</div>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <ul className="border-t-[1.5px] border-texto">
        {filas.map((fila) => {
          const confirmada = confirmadas.includes(fila.tarea)
          return (
            <li key={fila.tarea} className="grid grid-cols-[1.75rem_1fr] items-start gap-x-3.5 gap-y-2 border-b border-borde/15 py-5 sm:grid-cols-[1.75rem_1fr_auto]">
              <input
                id={`tarea-${fila.tarea}`}
                type="checkbox"
                checked={confirmada}
                onChange={() => alAlternar(fila.tarea)}
                className="mt-1 size-5 accent-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
              />
              <label htmlFor={`tarea-${fila.tarea}`} className={`cursor-pointer ${confirmada ? '' : 'opacity-50 line-through'}`}>
                <span className="text-parrafo block font-medium">{fila.titulo}</span>
                <span className="mt-2 block">
                  <Badge>{fila.fuente}</Badge>
                </span>
              </label>
              <span className={`col-start-2 sm:col-start-3 ${confirmada ? '' : 'opacity-50'}`}>
                <NivelPuntos nivel={fila.nivel} texto={fila.nivelTexto} />
              </span>
            </li>
          )
        })}
      </ul>

      <p role="status" className="text-cuerpo mt-4 opacity-80">
        {rellenarPlantilla(t.contador, { n: confirmadas.length, total: filas.length })}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
        <Boton lleno alPulsar={alConfirmar}>
          {t.confirmar}
        </Boton>
        {botonVolver}
      </div>
      <p className="text-nota mt-3 opacity-75">{t.pie}</p>
    </div>
  )
}
