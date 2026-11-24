'use client'

import { useState } from 'react'
import type { HabilidadPerfil } from '../../domain/perfil'
import type { TextosPerfil } from '../../language/tipos'
import type { PasoPerfil } from '../pasos'
import { EnlaceEditar } from '../ui/EnlaceEditar'
import { NombreHabilidad } from '../ui/NombreHabilidad'
import { PuntosNivel } from '../ui/PuntosNivel'
import { TarjetaBloque } from '../ui/TarjetaBloque'
import { HabilidadFuerte } from '../ui/HabilidadFuerte'

type Props = { textos: TextosPerfil; paso: PasoPerfil; habilidades: HabilidadPerfil[] }

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
          <p className="text-nota mb-1 mt-3.5 text-texto-tenue">{textos.habilidades.otras}</p>
          <ul>
            {otras.map((habilidad) => (
              <li key={habilidad.nombre} className="grid grid-cols-[1fr_auto] items-center gap-x-3.5 gap-y-1 border-b border-borde/10 py-3.5 last:border-b-0">
                <NombreHabilidad habilidad={habilidad} textos={textos} />
                <PuntosNivel nivel={habilidad.nivel} etiqueta={textos.habilidades.nivel} />
                <span className="text-nota col-span-full text-texto-tenue">{habilidad.resumen}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </TarjetaBloque>
  )
}
