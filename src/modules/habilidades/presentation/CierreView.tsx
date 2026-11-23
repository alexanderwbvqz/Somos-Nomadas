'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { Badge } from '@/shared/ui/Badge'
import { foco } from '@/shared/ui/EnlaceBoton'
import { FondoPuntos } from '@/shared/ui/FondoPuntos'
import type { TextosHabilidades } from '../language/tipos'
import { useCierre, type AccionPrepararCierre } from './hooks/useCierre'

export type CierreViewProps = {
  textos: TextosHabilidades
  /** Las iniciales de la persona, ya hechas; vacías si no se sabe su nombre */
  iniciales: string
  /** El logo claro, que se ve sobre el fondo oscuro */
  logoSrc: string
  hrefInicio: string
  alPreparar: AccionPrepararCierre
  /** Cuánto espera como mínimo antes de mostrar el resultado; las pruebas la ponen en cero */
  esperaMinima?: number
}

const claseBotonInactivo = 'text-etiqueta inline-flex items-center gap-3 rounded-full border-2 px-6 py-3 cursor-not-allowed'

// Pantalla final del recorrido, sobre un fondo oscuro de puntos: primero una espera («armando tu propuesta») y luego dos caminos.
// Ni el directorio ni «Mi perfil» existen todavía: los dos caminos se muestran apagados y con la insignia «Pronto».
export function CierreView({ textos, iniciales, logoSrc, hrefInicio, alPreparar, esperaMinima }: CierreViewProps) {
  const t = textos.cierre
  const { estado, reintentar } = useCierre(alPreparar, esperaMinima)
  const titulo = useRef<HTMLHeadingElement>(null)
  const primeraVez = useRef(true)

  // Al cambiar de estado (listo o fallo) el foco va al título; no al cargar la pantalla
  useEffect(() => {
    if (primeraVez.current) {
      primeraVez.current = false
      return
    }
    if (estado !== 'esperando') titulo.current?.focus()
  }, [estado])

  const contenido = {
    esperando: { titulo: t.esperaTitulo, texto: t.esperaTexto },
    listo: { titulo: t.listoTitulo, texto: t.listoTexto },
    fallo: t.fallo,
  }[estado]

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-texto text-fondo">
      <FondoPuntos className="text-fondo" />
      <div className="relative px-6 py-6 escritorio:px-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt={t.logoAlt} className="h-10 w-auto" />
      </div>

      <div className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
        {iniciales !== '' && (
          <div role="img" aria-label={t.avatar} className="text-titulo-tarjeta mb-6 flex size-20 items-center justify-center rounded-full border-2 border-fondo/60">
            <span aria-hidden="true">{iniciales}</span>
          </div>
        )}

        {estado === 'esperando' && <span aria-hidden="true" data-estado="esperando" className="girar mb-6 size-11 rounded-full border-[3px] border-fondo/20 border-t-fondo" />}

        <div aria-live="polite">
          <h1 ref={titulo} tabIndex={-1} className="text-titulo-seccion texto-equilibrado outline-none">
            {contenido.titulo}
          </h1>
          <p className="text-parrafo-grande mt-4 opacity-85">{contenido.texto}</p>
        </div>

        {estado === 'listo' && (
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <button type="button" disabled className={`${claseBotonInactivo} border-fondo bg-fondo text-texto`}>
              {t.descubrir} <Badge>{t.pronto}</Badge>
            </button>
            <button type="button" disabled className={`${claseBotonInactivo} border-fondo/60 bg-texto text-fondo/80`}>
              {t.revisarPerfil} <Badge tono="oscuro">{t.pronto}</Badge>
            </button>
          </div>
        )}

        {estado === 'fallo' && (
          <div className="mt-9">
            <button type="button" onClick={reintentar} className={`text-etiqueta cursor-pointer rounded-full border-2 border-fondo px-6 py-3 ${foco}`}>
              {t.reintentar}
            </button>
          </div>
        )}

        {estado !== 'esperando' && (
          <Link href={hrefInicio} className={`text-etiqueta mt-8 underline underline-offset-8 ${foco}`}>
            {t.inicio}
          </Link>
        )}
      </div>
    </main>
  )
}
