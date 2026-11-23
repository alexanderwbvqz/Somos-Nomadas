'use client'

import { useState, type ReactNode } from 'react'
import { Boton } from '@/shared/ui/Boton'
import { caminoPorDefecto, caminos, estaDisponible, type Camino } from '../domain/camino'
import type { TextosHabilidades } from '../language/tipos'
import { TarjetaCamino } from './components/TarjetaCamino'
import { textoSaludo } from './mappers/saludo'

export type InicioHabilidadesViewProps = {
  textos: TextosHabilidades
  /** El nombre de la persona, si se conoce, para saludarla */
  nombre?: string
  /** La barra de arriba (logo, progreso y «Saltar»); la pone quien arma la pantalla, y va fuera del <main> */
  barra: ReactNode
}

// Primer paso del perfil de habilidades: elegir cómo empezar. Por ahora solo se puede arrancar de cero, y el paso
// siguiente todavía no existe: «Arrancar» lo avisa en vez de llevar a una página que no está.
export function InicioHabilidadesView({ textos, nombre, barra }: InicioHabilidadesViewProps) {
  const t = textos.inicio
  const [camino, setCamino] = useState<Camino>(caminoPorDefecto)
  const [avisado, setAvisado] = useState(false)

  return (
    <>
      {barra}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-6 py-9 escritorio:px-12 escritorio:py-[4.5rem]">
          <h1 className="text-titulo texto-equilibrado">{textoSaludo(t, nombre)}</h1>
          <p className="text-parrafo-grande mt-4 max-w-xl opacity-85">{t.subtitulo}</p>

          <fieldset className="mt-10">
            <legend className="sr-only">{t.etiquetaCaminos}</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {caminos.map((opcion) => (
                <TarjetaCamino
                  key={opcion}
                  camino={opcion}
                  textos={t.caminos[opcion]}
                  elegido={camino === opcion}
                  disponible={estaDisponible(opcion)}
                  alElegir={setCamino}
                />
              ))}
            </div>
          </fieldset>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Boton lleno alPulsar={() => setAvisado(true)}>
              {t.arrancar}
            </Boton>
            <p className="text-parrafo opacity-85">{t.notaPublicar}</p>
          </div>
          {avisado && (
            <p role="status" className="text-cuerpo mt-5 rounded-xl bg-suave px-4 py-3">
              {t.proximo}
            </p>
          )}
        </div>
      </main>
    </>
  )
}
