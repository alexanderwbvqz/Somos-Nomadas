'use client'

import Link from 'next/link'
import type { FormEvent, ReactNode } from 'react'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { Boton } from '@/shared/ui/Boton'
import { foco } from '@/shared/ui/EnlaceBoton'
import { habilidades } from '../domain/catalogo'
import type { Marcas } from '../domain/perfilArea'
import type { TextosHabilidades } from '../language/tipos'
import { GrupoDeTareas } from './components/GrupoDeTareas'
import { useTareas, type AccionGuardarTareas } from './hooks/useTareas'
import { vistaTareas } from './mappers/vistaTareas'

export type TareasViewProps = {
  textos: TextosHabilidades
  /** Lo que ya marcó, si vuelve a este paso */
  marcasIniciales: Marcas
  alGuardar: AccionGuardarTareas
  /** La barra de arriba (logo, progreso y «Saltar»); la pone quien arma la pantalla, y va fuera del <main> */
  barra: ReactNode
  hrefAtras: string
  /** Adónde va la persona en cuanto se guardan las tareas */
  hrefSiguiente: string
}

// «Qué has hecho»: las 30 tareas en grupos que se abren y se cierran. Se marcan las que ya hizo y cuántas veces.
export function TareasView({ textos, marcasIniciales, alGuardar, barra, hrefAtras, hrefSiguiente }: TareasViewProps) {
  const t = textos.tareas
  const e = useTareas(marcasIniciales, alGuardar, hrefSiguiente)

  function alEnviar(evento: FormEvent) {
    evento.preventDefault()
    void e.enviar()
  }

  return (
    <>
      {barra}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-6 py-9 escritorio:py-[4.5rem]">
          <h1 className="text-titulo-seccion texto-equilibrado">{t.titulo}</h1>
          <p className="text-parrafo-grande mt-3 max-w-xl opacity-85">{t.subtitulo}</p>
          <p className="text-cuerpo mt-3 max-w-xl opacity-75">{t.porQue}</p>

          <form onSubmit={alEnviar} className="mt-8">
            <div className="grid gap-3">
              {vistaTareas(t, e.marcas, e.abiertos).map((grupo) => (
                <GrupoDeTareas
                  key={grupo.grupo}
                  textos={t}
                  grupo={grupo}
                  alAlternarGrupo={e.alternarGrupo}
                  alAlternar={e.alternarTarea}
                  alCambiarFrecuencia={e.cambiarFrecuencia}
                />
              ))}
            </div>

            <p className="text-cuerpo mt-4 opacity-80">{rellenarPlantilla(t.contadorTotal, { n: e.cantidad, total: habilidades.length })}</p>

            {e.aviso && (
              <p role="alert" className="text-cuerpo mt-5 flex items-start gap-2.5 rounded-xl border-2 border-primario px-4 py-3 font-medium">
                <span aria-hidden="true" className="text-etiqueta-chica mt-0.5 inline-flex size-5 flex-none items-center justify-center rounded-full bg-primario leading-none text-tarjeta">
                  !
                </span>
                <span>{t.avisos[e.aviso]}</span>
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-borde/15 pt-6">
              <Link href={hrefAtras} className={`text-etiqueta underline underline-offset-8 ${foco}`}>
                <span aria-hidden="true">← </span>
                {t.atras}
              </Link>
              <div className="flex flex-col items-end gap-2">
                <Boton tipo="submit" lleno deshabilitado={!e.completo || e.enviando || e.guardado} cursorDeshabilitado={e.enviando || e.guardado ? 'espera' : 'bloqueado'}>
                  {e.enviando || e.guardado ? t.guardando : t.siguiente}
                </Boton>
                {!e.completo && <p className="text-nota opacity-75">{t.minimo}</p>}
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
