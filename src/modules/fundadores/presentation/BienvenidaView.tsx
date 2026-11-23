'use client'

import { useEffect } from 'react'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import type { TextosFundadores } from '../language/tipos'
import { BienvenidaGuardada } from './components/BienvenidaGuardada'
import { FormularioBienvenida } from './components/FormularioBienvenida'
import { useBienvenida, type AccionGuardarBienvenida } from './hooks/useBienvenida'
import { Progreso } from './ui/Progreso'
import { TarjetaBienvenida } from './ui/TarjetaBienvenida'

export type BienvenidaViewProps = {
  textos: TextosFundadores
  alGuardar: AccionGuardarBienvenida
  /** Adónde lleva "Volver al inicio" una vez guardado, mientras no exista el directorio */
  hrefInicio: string
}

const PASOS_TOTAL = 2

// Paso 1 del perfil: nombre, dónde está y qué busca. Al guardar muestra un mensaje provisional: el directorio
// todavía no existe.
export function BienvenidaView({ textos, alGuardar, hrefInicio }: BienvenidaViewProps) {
  const { datos, errores, enviando, aviso, nombreGuardado, enfoque, completo, cambiar, alternar, enviar } = useBienvenida(alGuardar)
  const t = textos.bienvenida

  useEffect(() => {
    if (enfoque) document.getElementById(enfoque.id)?.focus()
  }, [enfoque])

  if (nombreGuardado !== undefined) return <BienvenidaGuardada textos={t} nombre={nombreGuardado} hrefInicio={hrefInicio} />

  return (
    <TarjetaBienvenida>
      <Progreso texto={rellenarPlantilla(t.paso, { actual: 1, total: PASOS_TOTAL })} actual={1} total={PASOS_TOTAL} />
      <h1 className="text-titulo-seccion mt-6">{t.titulo}</h1>
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
  )
}
