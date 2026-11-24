'use client'

import { useEffect, type ReactNode } from 'react'
import type { TextosFundadores } from '../language/tipos'
import { FormularioBienvenida } from './components/FormularioBienvenida'
import { useBienvenida, type AccionGuardarBienvenida } from './hooks/useBienvenida'
import { TarjetaBienvenida } from './components/TarjetaBienvenida'

export type BienvenidaViewProps = {
  textos: TextosFundadores
  alGuardar: AccionGuardarBienvenida
  /** Adónde va la persona en cuanto se guarda la bienvenida */
  hrefSiguiente: string
  /** La barra de arriba (con el logo); la pone quien arma la pantalla, y va fuera del <main> */
  barra: ReactNode
}

// Alta del perfil: nombre, dónde está y qué busca. Es un solo paso; al guardar lleva al siguiente.
export function BienvenidaView({ textos, alGuardar, hrefSiguiente, barra }: BienvenidaViewProps) {
  const { datos, errores, enviando, guardado, aviso, enfoque, completo, cambiar, alternar, enviar } = useBienvenida(alGuardar, hrefSiguiente)
  const t = textos.bienvenida

  useEffect(() => {
    if (enfoque) document.getElementById(enfoque.id)?.focus()
  }, [enfoque])

  return (
    <>
      {barra}
      <main className="flex-1">
        <TarjetaBienvenida>
          <h1 className="text-titulo-seccion">{t.titulo}</h1>
          <p className="text-parrafo mt-2 text-texto-suave">{t.intro}</p>
          <FormularioBienvenida
            textos={t}
            datos={datos}
            errores={errores}
            enviando={enviando}
            guardado={guardado}
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
