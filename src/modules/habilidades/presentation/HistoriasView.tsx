'use client'

import Link from 'next/link'
import { useEffect, type FormEvent, type ReactNode } from 'react'
import { Boton } from '@/shared/ui/Boton'
import { CampoArea, Casilla } from '@/shared/ui/Campos'
import { foco } from '@/shared/ui/EnlaceBoton'
import { LIMITES_HISTORIAS, type DatosHistorias } from '../domain/historias'
import type { TextosHabilidades } from '../language/tipos'
import { OpcionesSectores } from './components/OpcionesSectores'
import { useHistorias, type AccionGuardarHistorias } from './hooks/useHistorias'
import { mensajeDeErrorHistorias } from './mappers/mensajesErrorHistorias'

export type HistoriasViewProps = {
  textos: TextosHabilidades
  /** Lo que ya escribió, si vuelve a este paso */
  inicial: DatosHistorias
  alGuardar: AccionGuardarHistorias
  /** La barra de arriba (logo, progreso y «Saltar»); la pone quien arma la pantalla, y va fuera del <main> */
  barra: ReactNode
  hrefAtras: string
  /** Adónde va la persona en cuanto se guarda lo que escribió */
  hrefSiguiente: string
  /** Adónde lleva «Más información» sobre el permiso de análisis */
  hrefInformacion: string
}

// «Tus historias»: tres textos y los sectores que le mueven, todo opcional. Si escribe algo, aparece la casilla del permiso
// para analizarlo con inteligencia artificial; sin ese permiso no se guarda.
export function HistoriasView({ textos, inicial, alGuardar, barra, hrefAtras, hrefSiguiente, hrefInformacion }: HistoriasViewProps) {
  const t = textos.historias
  const e = useHistorias(inicial, alGuardar, hrefSiguiente)
  const error = (campo: keyof typeof e.errores) => mensajeDeErrorHistorias(t, e.errores[campo])

  // Si hay un error a la vista, el foco va al primer campo con problema
  useEffect(() => {
    if (e.enfoque) document.getElementById(e.enfoque.id)?.focus()
  }, [e.enfoque])

  function alEnviar(evento: FormEvent) {
    evento.preventDefault()
    void e.enviar()
  }

  const opcional = <span className="font-normal opacity-65">{t.opcional}</span>

  return (
    <>
      {barra}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-6 py-9 escritorio:py-[4.5rem]">
          <h1 className="text-titulo-seccion texto-equilibrado">{t.titulo}</h1>
          <p className="text-parrafo-grande mt-3 max-w-xl opacity-85">{t.subtitulo}</p>
          <p className="text-cuerpo mt-3 max-w-xl opacity-75">{t.porQue}</p>

          <form noValidate onSubmit={alEnviar} className="mt-8 grid gap-7">
            <CampoArea
              clave="logro"
              etiqueta={<>{t.campos.logro.etiqueta} {opcional}</>}
              ayuda={t.campos.logro.ayuda}
              placeholder={t.campos.logro.ejemplo}
              filas={4}
              maxLength={LIMITES_HISTORIAS.texto * 2}
              valor={e.datos.logro}
              alCambiar={(texto) => e.escribir('logro', texto)}
              error={error('logro')}
            />
            <CampoArea
              clave="problemaDificil"
              etiqueta={<>{t.campos.problemaDificil.etiqueta} {opcional}</>}
              ayuda={t.campos.problemaDificil.ayuda}
              placeholder={t.campos.problemaDificil.ejemplo}
              filas={4}
              maxLength={LIMITES_HISTORIAS.texto * 2}
              valor={e.datos.problemaDificil}
              alCambiar={(texto) => e.escribir('problemaDificil', texto)}
              error={error('problemaDificil')}
            />
            <CampoArea
              clave="problemaMundo"
              etiqueta={<>{t.campos.problemaMundo.etiqueta} {opcional}</>}
              placeholder={t.campos.problemaMundo.ejemplo}
              filas={3}
              maxLength={LIMITES_HISTORIAS.texto * 2}
              valor={e.datos.problemaMundo}
              alCambiar={(texto) => e.escribir('problemaMundo', texto)}
              error={error('problemaMundo')}
            />

            <OpcionesSectores textos={t} marcados={e.datos.sectores} alElegir={e.elegirSector} error={error('sectores')} />

            <p className="text-cuerpo rounded-xl bg-suave px-4 py-3">{t.nota}</p>

            {e.pidePermiso && (
              <Casilla clave="aceptaAnalisis" marcada={e.datos.aceptaAnalisis} alCambiar={e.darPermiso} error={error('aceptaAnalisis')}>
                {t.permiso.texto}{' '}
                <a href={hrefInformacion} target="_blank" rel="noopener noreferrer" className={`underline underline-offset-4 ${foco}`}>
                  {t.permiso.enlace}
                </a>
                .
              </Casilla>
            )}

            {e.aviso && (
              <p role="alert" className="text-cuerpo flex items-start gap-2.5 rounded-xl border-2 border-primario px-4 py-3 font-medium">
                <span aria-hidden="true" className="text-etiqueta-chica mt-0.5 inline-flex size-5 flex-none items-center justify-center rounded-full bg-primario leading-none text-tarjeta">
                  !
                </span>
                <span>{t.avisos[e.aviso]}</span>
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-borde/15 pt-6">
              <Link href={hrefAtras} className={`text-etiqueta underline underline-offset-8 ${foco}`}>
                <span aria-hidden="true">← </span>
                {t.atras}
              </Link>
              <Boton tipo="submit" lleno deshabilitado={e.enviando || e.guardado} cursorDeshabilitado="espera">
                {e.enviando || e.guardado ? t.guardando : t.siguiente}
              </Boton>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
