'use client'

import Link from 'next/link'
import type { FormEvent, ReactNode } from 'react'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { Boton } from '@/shared/ui/Boton'
import { foco } from '@/shared/ui/EnlaceBoton'
import { FilaAcciones } from '@/shared/ui/FilaAcciones'
import { LayoutPaso } from '@/shared/ui/LayoutPaso'
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
  /** Lo de arriba (barra con el logo y «Saltar», y el progreso); lo pone quien arma la pantalla, y va fuera del <main> */
  barra: ReactNode
  /** El número del paso, para rotularlo («Paso 02») */
  paso: number
  hrefAtras: string
  /** Adónde va la persona en cuanto se guardan las tareas */
  hrefSiguiente: string
}

// «Qué has hecho»: las 30 tareas en grupos que se abren y se cierran. Se marcan las que ya hizo y cuántas veces.
export function TareasView({ textos, marcasIniciales, alGuardar, barra, paso, hrefAtras, hrefSiguiente }: TareasViewProps) {
  const t = textos.tareas
  const e = useTareas(marcasIniciales, alGuardar, hrefSiguiente)

  function alEnviar(evento: FormEvent) {
    evento.preventDefault()
    void e.enviar()
  }

  return (
    <>
      {barra}
      <LayoutPaso
        etiqueta={rellenarPlantilla(textos.comun.numeroPaso, { n: String(paso).padStart(2, '0') })}
        titulo={t.titulo}
        subtitulo={t.subtitulo}
        porQue={{ titulo: textos.comun.porQue, texto: t.porQue }}
      >
        <form onSubmit={alEnviar}>
          <div className="grid gap-3">
            {vistaTareas(t, e.marcas, e.abiertos).map((grupo, indice) => (
              <GrupoDeTareas
                key={grupo.grupo}
                textos={t}
                grupo={grupo}
                indice={indice}
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

          <FilaAcciones
            izquierda={
              <Link href={hrefAtras} className={`text-etiqueta underline underline-offset-8 ${foco}`}>
                <span aria-hidden="true">← </span>
                {t.atras}
              </Link>
            }
            derecha={
              <div className="flex flex-col items-end gap-2">
                <Boton tipo="submit" lleno deshabilitado={!e.completo || e.enviando || e.guardado} cursorDeshabilitado={e.enviando || e.guardado ? 'espera' : 'bloqueado'}>
                  {e.enviando || e.guardado ? t.guardando : t.siguiente}
                </Boton>
                {!e.completo && <p className="text-nota opacity-75">{t.minimo}</p>}
              </div>
            }
          />
        </form>
      </LayoutPaso>
    </>
  )
}
