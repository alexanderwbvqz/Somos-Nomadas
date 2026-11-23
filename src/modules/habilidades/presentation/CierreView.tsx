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
  /** El isotipo, que hace de avatar cuando no se sabe el nombre */
  isotipoSrc: string
  hrefInicio: string
  /** Adónde lleva «Revisar mi perfil» */
  hrefPerfil: string
  alPreparar: AccionPrepararCierre
  /** Cuánto espera como mínimo antes de mostrar el resultado; las pruebas la ponen en cero */
  esperaMinima?: number
}

const claseBoton = 'text-etiqueta inline-flex items-center gap-3 rounded-full border-2 px-7 py-[0.9375rem]'

// Pantalla final del recorrido, sobre un fondo oscuro de puntos: primero una espera («armando tu propuesta») y luego dos caminos.
// «Revisar mi perfil» lleva a la página del perfil. El directorio todavía no existe: «Ir a descubrir» se muestra apagado y con la
// insignia «Pronto».
export function CierreView({ textos, iniciales, logoSrc, isotipoSrc, hrefInicio, hrefPerfil, alPreparar, esperaMinima }: CierreViewProps) {
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
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-fondo-oscuro text-fondo">
      <FondoPuntos className="text-fondo" />
      <div className="relative px-6 py-5 escritorio:px-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt={t.logoAlt} className="h-10 w-auto" />
      </div>

      <div className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
        <div role="img" aria-label={t.avatar} className="mb-7 flex size-28 items-center justify-center overflow-hidden rounded-full bg-fondo font-serif text-[2.625rem] text-texto">
          {iniciales !== '' ? (
            <span aria-hidden="true">{iniciales}</span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={isotipoSrc} alt="" className="size-full object-cover" />
          )}
        </div>

        {estado === 'esperando' && <span aria-hidden="true" data-estado="esperando" className="girar mb-6 size-11 rounded-full border-[3px] border-fondo/20 border-t-fondo" />}

        <div aria-live="polite" className="max-w-[39.5rem]">
          <h1 ref={titulo} tabIndex={-1} className="text-titulo-medio texto-equilibrado outline-none">
            {contenido.titulo}
          </h1>
          <p className="text-parrafo-grande mt-4 opacity-85">{contenido.texto}</p>
        </div>

        {estado === 'listo' && (
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <button type="button" disabled className={`${claseBoton} cursor-not-allowed border-fondo bg-fondo text-texto`}>
              {t.descubrir} <span aria-hidden="true">→</span> <Badge>{t.pronto}</Badge>
            </button>
            <Link href={hrefPerfil} className={`${claseBoton} border-fondo/60 bg-fondo-oscuro text-fondo hover:bg-fondo hover:text-texto ${foco}`}>
              {t.revisarPerfil}
            </Link>
          </div>
        )}

        {estado === 'fallo' && (
          <div className="mt-9">
            <button type="button" onClick={reintentar} className={`text-etiqueta cursor-pointer rounded-full border-2 border-fondo px-7 py-[0.9375rem] ${foco}`}>
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
