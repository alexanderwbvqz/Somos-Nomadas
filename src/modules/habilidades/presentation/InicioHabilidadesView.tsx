'use client'

import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { Boton } from '@/shared/ui/Boton'
import { caminoPorDefecto, caminos, type Camino } from '../domain/camino'
import type { TextosHabilidades } from '../language/tipos'
import { TarjetaCamino } from './components/TarjetaCamino'
import { textoSaludo } from './mappers/saludo'

export type InicioHabilidadesViewProps = {
  textos: TextosHabilidades
  /** El nombre de la persona, si se conoce, para saludarla */
  nombre?: string
  /** Los caminos que se pueden elegir; los demás salen apagados con su etiqueta */
  disponibles: readonly Camino[]
  /** Adónde lleva «Arrancar» según el camino; un camino sin ruta es un paso que todavía no existe */
  rutas: Partial<Record<Camino, string>>
  /** La barra de arriba (logo, progreso y «Saltar»); la pone quien arma la pantalla, y va fuera del <main> */
  barra: ReactNode
}

// Primer paso del perfil de habilidades: elegir cómo empezar. Un camino cuyo paso siguiente todavía no existe lo avisa
// al pulsar «Arrancar», en vez de llevar a una página que no está.
export function InicioHabilidadesView({ textos, nombre, disponibles, rutas, barra }: InicioHabilidadesViewProps) {
  const t = textos.inicio
  const router = useRouter()
  const [camino, setCamino] = useState<Camino>(caminoPorDefecto)
  const [avisado, setAvisado] = useState(false)

  function arrancar() {
    const ruta = rutas[camino]
    if (ruta) router.push(ruta)
    else setAvisado(true)
  }

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
                  disponible={disponibles.includes(opcion)}
                  alElegir={(elegido) => {
                    setCamino(elegido)
                    setAvisado(false)
                  }}
                />
              ))}
            </div>
          </fieldset>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Boton lleno alPulsar={arrancar}>
              {t.arrancar}
            </Boton>
            <p className="text-parrafo opacity-85">{t.notaPublicar}</p>
          </div>
          {avisado && (
            <p role="status" className="text-cuerpo mt-5 rounded-xl bg-suave px-4 py-3">
              {textos.comun.proximo}
            </p>
          )}
        </div>
      </main>
    </>
  )
}
