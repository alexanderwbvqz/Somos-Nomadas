'use client'

import { useId, useState } from 'react'
import { foco } from '@/shared/ui/EnlaceBoton'
import type { HabilidadPerfil } from '../../domain/perfil'
import type { TextosPerfil } from '../../language/tipos'
import type { PasoPerfil } from '../pasos'
import { EnlaceEditar } from '../ui/EnlaceEditar'
import { NombreHabilidad } from '../ui/NombreHabilidad'
import { ParRespuesta } from '../ui/ParRespuesta'
import { Respuestas } from '../ui/Respuestas'
import { PuntosNivel } from '../ui/PuntosNivel'
import { TarjetaBloque } from '../ui/TarjetaBloque'

type Props = { textos: TextosPerfil; paso: PasoPerfil; habilidades: HabilidadPerfil[] }

// Una de las habilidades más fuertes: se abre para ver lo que la persona contó de ella.
function HabilidadFuerte({ habilidad, textos, abierta, alAlternar }: { habilidad: HabilidadPerfil; textos: TextosPerfil; abierta: boolean; alAlternar: () => void }) {
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

// «Habilidades»: las más fuertes se abren con lo que la persona contó; las demás van solo con su nivel. La primera empieza abierta.
export function BloqueHabilidades({ textos, paso, habilidades }: Props) {
  const [abierta, setAbierta] = useState<number | undefined>(0)
  const fuertes = habilidades.filter((habilidad) => habilidad.detalle !== undefined)
  const otras = habilidades.filter((habilidad) => habilidad.detalle === undefined)

  return (
    <TarjetaBloque titulo={textos.habilidades.titulo} accion={<EnlaceEditar textos={textos} paso={paso} />}>
      {fuertes.map((habilidad, lugar) => (
        <HabilidadFuerte key={habilidad.nombre} habilidad={habilidad} textos={textos} abierta={abierta === lugar} alAlternar={() => setAbierta(abierta === lugar ? undefined : lugar)} />
      ))}
      {otras.length > 0 && (
        <>
          <p className="text-nota mb-1 mt-3.5 opacity-65">{textos.habilidades.otras}</p>
          <ul>
            {otras.map((habilidad) => (
              <li key={habilidad.nombre} className="grid grid-cols-[1fr_auto] items-center gap-x-3.5 gap-y-1 border-b border-borde/10 py-3.5 last:border-b-0">
                <NombreHabilidad habilidad={habilidad} textos={textos} />
                <PuntosNivel nivel={habilidad.nivel} etiqueta={textos.habilidades.nivel} />
                <span className="text-nota col-span-full opacity-70">{habilidad.resumen}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </TarjetaBloque>
  )
}
