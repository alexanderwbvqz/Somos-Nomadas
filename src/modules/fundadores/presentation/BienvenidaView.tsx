'use client'

import { useEffect, type ReactNode } from 'react'
import type { TextosFundadores } from '../language/tipos'
import { BienvenidaGuardada } from './components/BienvenidaGuardada'
import { FormularioBienvenida } from './components/FormularioBienvenida'
import { useBienvenida, type AccionGuardarBienvenida } from './hooks/useBienvenida'
import { TarjetaBienvenida } from './ui/TarjetaBienvenida'

export type BienvenidaViewProps = {
  textos: TextosFundadores
  alGuardar: AccionGuardarBienvenida
  /** Adónde lleva "Volver al inicio" una vez guardado, mientras no exista el directorio */
  hrefInicio: string
  /** La barra de arriba (logo y progreso) mientras se rellena; la pone quien arma la pantalla */
  barraPaso1: ReactNode
  /** La barra de arriba una vez guardado, que hace de paso 2 mientras no exista el directorio */
  barraPaso2: ReactNode
}

// Paso 1 del perfil: nombre, dónde está y qué busca. Al guardar muestra un mensaje provisional: el directorio
// todavía no existe. Lleva su barra y su <main> porque la barra depende de en qué paso va.
export function BienvenidaView({ textos, alGuardar, hrefInicio, barraPaso1, barraPaso2 }: BienvenidaViewProps) {
  const { datos, errores, enviando, aviso, nombreGuardado, enfoque, completo, cambiar, alternar, enviar } = useBienvenida(alGuardar)
  const t = textos.bienvenida

  useEffect(() => {
    if (enfoque) document.getElementById(enfoque.id)?.focus()
  }, [enfoque])

  if (nombreGuardado !== undefined) {
    return (
      <>
        {barraPaso2}
        <main className="flex-1">
          <BienvenidaGuardada textos={t} nombre={nombreGuardado} hrefInicio={hrefInicio} />
        </main>
      </>
    )
  }

  return (
    <>
      {barraPaso1}
      <main className="flex-1">
        <TarjetaBienvenida>
          <h1 className="text-titulo-seccion">{t.titulo}</h1>
          <p className="text-parrafo mt-2 opacity-80">{t.intro}</p>
          <FormularioBienvenida
            textos={t}
            datos={datos}
            errores={errores}
            enviando={enviando}
            completo={completo}
            aviso={aviso}
            cambiar={cambiar}
            alternar={alternar}
            alEnviar={enviar}
          />
        </TarjetaBienvenida>
      </main>
    </>
  )
}
