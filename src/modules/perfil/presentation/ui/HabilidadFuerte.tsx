import { useId } from 'react'
import { foco } from '@/shared/ui/EnlaceBoton'
import type { HabilidadPerfil } from '../../domain/perfil'
import type { TextosPerfil } from '../../language/tipos'
import { NombreHabilidad } from './NombreHabilidad'
import { ParRespuesta } from './ParRespuesta'
import { PuntosNivel } from './PuntosNivel'
import { Respuestas } from './Respuestas'

// Una de las habilidades más fuertes: se abre para ver lo que la persona contó de ella.
export function HabilidadFuerte({ habilidad, textos, abierta, alAlternar }: { habilidad: HabilidadPerfil; textos: TextosPerfil; abierta: boolean; alAlternar: () => void }) {
  const id = useId()
  const detalle = habilidad.detalle
  return (
    <div className="border-b border-borde/10">
      <h3>
        <button
          type="button"
          aria-expanded={abierta}
          aria-controls={id}
          onClick={alAlternar}
          className={`grid w-full cursor-pointer grid-cols-[1fr_auto_auto] items-center gap-x-3.5 gap-y-1 py-3.5 text-left ${foco}`}
        >
          <NombreHabilidad habilidad={habilidad} textos={textos} />
          <PuntosNivel nivel={habilidad.nivel} etiqueta={textos.habilidades.nivel} />
          <span aria-hidden="true" className="flex size-[1.625rem] items-center justify-center rounded-full border-[1.5px] border-texto leading-none">
            {abierta ? '−' : '+'}
          </span>
          <span className="text-nota col-span-full opacity-70">{habilidad.resumen}</span>
        </button>
      </h3>
      {abierta && (
        <div id={id} className="grid gap-3.5 pb-5">
          {detalle && detalle.respuestas.length > 0 ? (
            detalle.respuestas.map((respuesta) => (
              <ParRespuesta key={respuesta.pregunta} pregunta={respuesta.pregunta}>
                <Respuestas respuestas={respuesta.respuestas} />
              </ParRespuesta>
            ))
          ) : (
            !detalle?.texto && <p className="text-parrafo italic opacity-65">{textos.habilidades.sinDetalle}</p>
          )}
          {detalle?.texto && (
            <ParRespuesta pregunta={detalle.texto.pregunta}>
              <p className="text-parrafo rounded-2xl bg-suave px-4 py-3 whitespace-pre-line">{detalle.texto.texto}</p>
            </ParRespuesta>
          )}
        </div>
      )}
    </div>
  )
}
