'use client'

import { useEffect, useRef, useState } from 'react'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { useCuentaAtras } from '@/shared/lib/useCuentaAtras'
import { Boton } from '@/shared/ui/Boton'
import { foco } from '@/shared/ui/EnlaceBoton'
import type { ResultadoReenvio } from '../../application/reenviarConfirmacion'
import type { TextosAcceso } from '../../language/tipos'

export type AccionReenviar = (correo: string) => Promise<ResultadoReenvio>

type Props = {
  textos: TextosAcceso
  correo: string
  alReenviar: AccionReenviar
  alCambiarCorreo: () => void
}

const ESPERA_SEGUNDOS = 30

function formatoTiempo(segundos: number): string {
  return `0:${String(segundos).padStart(2, '0')}`
}

// Lo que se ve tras crear la cuenta: a qué correo llegó el enlace y cómo pedirlo otra vez.
export function ConfirmaCorreo({ textos, correo, alReenviar, alCambiarCorreo }: Props) {
  const t = textos.confirmacion
  const { restantes, reiniciar } = useCuentaAtras(ESPERA_SEGUNDOS)
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<'reenviado' | 'limite' | 'fallo' | undefined>()
  const titulo = useRef<HTMLHeadingElement>(null)

  // Al aparecer, el foco va al título para que se anuncie el cambio de pantalla
  useEffect(() => {
    titulo.current?.focus()
  }, [])

  async function reenviar() {
    setEnviando(true)
    setResultado(undefined)
    try {
      const respuesta = await alReenviar(correo)
      if (respuesta.ok) {
        setResultado('reenviado')
        reiniciar()
      } else setResultado(respuesta.motivo)
    } catch {
      setResultado('fallo')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div>
      <span aria-hidden="true" className="mb-6 flex size-[4.5rem] items-center justify-center rounded-full border-[1.5px] border-texto bg-degradado-amarillo">
        <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      </span>
      <h2 ref={titulo} tabIndex={-1} className="text-titulo-seccion outline-none">
        {t.tarjetaTitulo}
      </h2>
      <p className="text-parrafo mt-2 text-texto-suave">{t.loEnviamosA}</p>
      <p className="mt-3 inline-block break-all rounded-full bg-suave px-4 py-2 font-medium">{correo}</p>
      <p className="text-parrafo mt-4 text-texto-suave">{t.nota}</p>

      <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-4">
        <Boton alPulsar={reenviar} deshabilitado={restantes > 0 || enviando}>
          {t.reenviar}
        </Boton>
        <button type="button" onClick={alCambiarCorreo} className={`text-parrafo underline underline-offset-4 ${foco}`}>
          {t.cambiarCorreo}
        </button>
      </div>

      <p className="text-nota mt-3 text-texto-suave">
        {restantes > 0 ? rellenarPlantilla(t.espera, { tiempo: formatoTiempo(restantes) }) : t.yaPuedes}
      </p>
      <p role="status" className="text-cuerpo mt-2 min-h-5 font-medium">
        {resultado === 'reenviado' ? t.reenviado : resultado ? textos.avisos[resultado] : ''}
      </p>

      <p className="text-cuerpo mt-6 rounded-xl bg-suave px-4 py-3">{t.spam}</p>
    </div>
  )
}
