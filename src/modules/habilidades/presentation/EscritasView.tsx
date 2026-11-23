'use client'

import Link from 'next/link'
import { useEffect, useRef, type ReactNode } from 'react'
import { foco } from '@/shared/ui/EnlaceBoton'
import type { TextosHabilidades } from '../language/tipos'
import { Leyendo } from './components/Leyendo'
import { Revision } from './components/Revision'
import { ZonaMaterial } from './components/ZonaMaterial'
import { useEscritas, type AccionAnalizar } from './hooks/useEscritas'

export type EscritasViewProps = {
  textos: TextosHabilidades
  alAnalizar: AccionAnalizar
  /** La barra de arriba (logo, progreso y «Saltar»); la pone quien arma la pantalla, y va fuera del <main> */
  barra: ReactNode
  /** Adónde lleva «Cambiar de camino» */
  hrefCambiarCamino: string
  /** Adónde lleva «Más información» sobre el permiso de análisis */
  hrefInformacion: string
}

// Segundo paso, por el camino de «tengo cosas escritas»: subir un PDF o pegar enlaces, esperar a que se lea y revisar lo
// que se entendió. Las tres son una misma pantalla que cambia de contenido. El paso siguiente todavía no existe.
export function EscritasView({ textos, alAnalizar, barra, hrefCambiarCamino, hrefInformacion }: EscritasViewProps) {
  const e = useEscritas(alAnalizar)
  const t = textos.escritas
  const titulo = useRef<HTMLHeadingElement>(null)
  const primeraVez = useRef(true)

  // Al pasar de una fase a otra el contenido cambia entero: el foco va al título nuevo para que no se pierda
  useEffect(() => {
    if (primeraVez.current) {
      primeraVez.current = false
      return
    }
    titulo.current?.focus()
  }, [e.fase])

  // Si un error está a la vista, el foco va al primer campo con problema
  useEffect(() => {
    if (e.enfoque) document.getElementById(e.enfoque.id)?.focus()
  }, [e.enfoque])

  const cabecera = {
    pegar: { titulo: t.titulo, subtitulo: t.subtitulo },
    leyendo: { titulo: t.leyendo.titulo, subtitulo: undefined },
    revisar: { titulo: t.revision.titulo, subtitulo: t.revision.subtitulo },
  }[e.fase]

  return (
    <>
      {barra}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-6 py-9 escritorio:py-[4.5rem]">
          {e.fase === 'pegar' && (
            <Link href={hrefCambiarCamino} className={`text-etiqueta-chica mb-6 inline-block underline underline-offset-8 ${foco}`}>
              <span aria-hidden="true">← </span>
              {t.cambiarCamino}
            </Link>
          )}
          <h1 ref={titulo} tabIndex={-1} className="text-titulo-seccion texto-equilibrado outline-none">
            {cabecera.titulo}
          </h1>
          {cabecera.subtitulo && <p className="text-parrafo-grande mt-3 max-w-xl opacity-85">{cabecera.subtitulo}</p>}

          {e.fase === 'pegar' && (
            <ZonaMaterial
              textos={t}
              datos={e.datos}
              errores={e.errores}
              aviso={e.aviso}
              puedeAnalizar={e.puedeAnalizar}
              hrefInformacion={hrefInformacion}
              alElegirArchivo={e.elegirArchivo}
              alQuitarArchivo={e.quitarArchivo}
              alCambiarEnlace={e.cambiarEnlace}
              alMarcarPermiso={e.marcarPermiso}
              alEnviar={e.analizar}
            />
          )}

          {e.fase === 'leyendo' && <Leyendo textos={t.leyendo} />}

          {e.fase === 'revisar' && (
            <Revision
              textos={t}
              sugerencias={e.sugerencias}
              confirmadas={e.confirmadas}
              alAlternar={e.alternarTarea}
              alConfirmar={e.confirmar}
              alVolver={e.volver}
            />
          )}

          {e.terminado && (
            <p role="status" className="text-cuerpo mt-5 rounded-xl bg-suave px-4 py-3">
              {textos.comun.proximo}
            </p>
          )}
        </div>
      </main>
    </>
  )
}
