'use client'

import Link from 'next/link'
import { useEffect, type FormEvent, type ReactNode } from 'react'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { Boton } from '@/shared/ui/Boton'
import { CampoArea } from '@/shared/ui/CampoArea'
import { Casilla } from '@/shared/ui/Casilla'
import { foco } from '@/shared/ui/EnlaceBoton'
import { FilaAcciones } from '@/shared/ui/FilaAcciones'
import { LayoutPaso } from '@/shared/ui/LayoutPaso'
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
  /** Lo de arriba (barra con el logo y «Saltar», y el progreso); lo pone quien arma la pantalla, y va fuera del <main> */
  barra: ReactNode
  /** El número del paso, para rotularlo («Paso 04») */
  paso: number
  hrefAtras: string
  /** Adónde va la persona en cuanto se guarda lo que escribió */
  hrefSiguiente: string
  /** Adónde lleva «Más información» sobre el permiso de análisis */
  hrefInformacion: string
}

// «Tus historias»: tres textos y los sectores que le mueven, todo opcional. Si escribe algo, aparece la casilla del permiso
// para mostrarlo en su perfil; sin ese permiso no se guarda.
export function HistoriasView({ textos, inicial, alGuardar, barra, paso, hrefAtras, hrefSiguiente, hrefInformacion }: HistoriasViewProps) {
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
      <LayoutPaso
        etiqueta={rellenarPlantilla(textos.comun.numeroPaso, { n: String(paso).padStart(2, '0') })}
        titulo={t.titulo}
        subtitulo={t.subtitulo}
        porQue={{ titulo: textos.comun.porQue, texto: t.porQue }}
      >
        <form noValidate onSubmit={alEnviar}>
          <div className="grid gap-7">
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
              <Casilla clave="aceptaMostrar" marcada={e.datos.aceptaMostrar} alCambiar={e.darPermiso} error={error('aceptaMostrar')}>
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
          </div>

          <FilaAcciones
            izquierda={
              <Link href={hrefAtras} className={`text-etiqueta underline underline-offset-8 ${foco}`}>
                <span aria-hidden="true">← </span>
                {t.atras}
              </Link>
            }
            derecha={
              <Boton tipo="submit" lleno deshabilitado={e.enviando || e.guardado} cursorDeshabilitado="espera">
                {e.enviando || e.guardado ? t.guardando : t.siguiente}
              </Boton>
            }
          />
        </form>
      </LayoutPaso>
    </>
  )
}
